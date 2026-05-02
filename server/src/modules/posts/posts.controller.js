import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../../shared/utils/errors.js';

const authorSelect = {
  id: true,
  name: true,
  role: true,
  avatarUrl: true,
};

const postInclude = {
  author: { select: authorSelect },
};

// Shape a post with viewer-specific fields (hasUpvoted, hasBookmarked).
const shapePost = (post, viewerId) => ({
  ...post,
  hasUpvoted: viewerId ? post.votes?.some((v) => v.userId === viewerId) : false,
  hasBookmarked: viewerId ? post.bookmarks?.some((b) => b.userId === viewerId) : false,
  votes: undefined,
  bookmarks: undefined,
});

export const listPosts = async (req, res) => {
  const { page, limit, category, authorRole, tag, q, sort } = req.query;

  const where = {
    status: 'PUBLISHED',
    ...(category ? { category } : {}),
    ...(authorRole ? { author: { role: authorRole } } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === 'new'
      ? [{ isPinned: 'desc' }, { createdAt: 'desc' }]
      : sort === 'top'
      ? [{ isPinned: 'desc' }, { upvoteCount: 'desc' }]
      : [
          { isPinned: 'desc' },
          { upvoteCount: 'desc' },
          { createdAt: 'desc' },
        ];

  const viewerId = req.user?.id;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        ...postInclude,
        votes: viewerId ? { where: { userId: viewerId }, select: { userId: true } } : false,
        bookmarks: viewerId
          ? { where: { userId: viewerId }, select: { userId: true } }
          : false,
      },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({
    items: items.map((p) => shapePost(p, viewerId)),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
};

export const getPost = async (req, res) => {
  const viewerId = req.user?.id;
  const post = await prisma.post.findFirst({
    where: { id: req.params.id, status: 'PUBLISHED' },
    include: {
      ...postInclude,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: authorSelect } },
      },
      votes: viewerId ? { where: { userId: viewerId }, select: { userId: true } } : false,
      bookmarks: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : false,
    },
  });
  if (!post) throw new NotFoundError('Post not found');
  res.json({ item: shapePost(post, viewerId) });
};

export const createPost = async (req, res) => {
  const post = await prisma.post.create({
    data: { ...req.body, authorId: req.user.id },
    include: postInclude,
  });
  res.status(201).json({ item: shapePost(post, req.user.id) });
};

export const updatePost = async (req, res) => {
  const existing = await prisma.post.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) throw new NotFoundError('Post not found');
  if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: req.body,
    include: postInclude,
  });
  res.json({ item: shapePost(post, req.user.id) });
};

export const deletePost = async (req, res) => {
  const existing = await prisma.post.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) throw new NotFoundError('Post not found');
  if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};

// Toggle upvote — transactional to keep counter accurate.
export const toggleUpvote = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  const existing = await prisma.postVote.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.postVote.delete({ where: { userId_postId: { userId, postId } } }),
      prisma.post.update({
        where: { id: postId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);
    return res.json({ upvoted: false });
  }

  await prisma.$transaction([
    prisma.postVote.create({ data: { userId, postId } }),
    prisma.post.update({
      where: { id: postId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ]);
  res.json({ upvoted: true });
};

export const toggleBookmark = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } });
    return res.json({ bookmarked: false });
  }

  await prisma.bookmark.create({ data: { userId, postId } });
  res.json({ bookmarked: true });
};

export const listMyBookmarks = async (req, res) => {
  const items = await prisma.bookmark.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { post: { include: postInclude } },
  });
  res.json({ items: items.map((b) => b.post) });
};

// Comments
export const listComments = async (req, res) => {
  const items = await prisma.comment.findMany({
    where: { postId: req.params.id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: authorSelect } },
  });
  res.json({ items });
};

export const addComment = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    select: { id: true, status: true },
  });
  if (!post || post.status !== 'PUBLISHED') throw new NotFoundError('Post not found');

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { postId: post.id, authorId: req.user.id, text: req.body.text },
      include: { author: { select: authorSelect } },
    }),
    prisma.post.update({
      where: { id: post.id },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  res.status(201).json({ item: comment });
};

export const deleteComment = async (req, res) => {
  const existing = await prisma.comment.findUnique({
    where: { id: req.params.id },
    select: { authorId: true, postId: true },
  });
  if (!existing) throw new NotFoundError('Comment not found');
  if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  await prisma.$transaction([
    prisma.comment.delete({ where: { id: req.params.id } }),
    prisma.post.update({
      where: { id: existing.postId },
      data: { commentCount: { decrement: 1 } },
    }),
  ]);
  res.json({ ok: true });
};

// Posts authored by the current user.
export const listMyPosts = async (req, res) => {
  const items = await prisma.post.findMany({
    where: { authorId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: postInclude,
  });
  res.json({ items });
};
