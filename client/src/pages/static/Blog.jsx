import { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'Top 10 Scholarships for International Students in Australia 2025',
    excerpt:
      'Discover the most generous scholarships available for international students planning to study in Australia, including government-funded and university-specific awards.',
    date: 'March 15, 2025',
    category: 'Scholarships',
    readTime: '7 min read',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'A Complete Guide to Student Visa Subclass 500',
    excerpt:
      'Everything you need to know about applying for an Australian student visa, from eligibility requirements to document checklists and processing times.',
    date: 'March 8, 2025',
    category: 'Visa Guide',
    readTime: '10 min read',
    color: 'bg-emerald-500',
  },
  {
    id: 3,
    title: 'Melbourne vs Sydney: Which City is Better for Students?',
    excerpt:
      'An honest comparison of Australia\'s two largest cities from a student perspective, covering cost of living, transport, nightlife, and job opportunities.',
    date: 'February 28, 2025',
    category: 'Student Life',
    readTime: '6 min read',
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'How to Choose the Right Education Agent for Your Needs',
    excerpt:
      'Not all education agents are the same. Learn what to look for, what questions to ask, and how to verify credentials before committing to an agent.',
    date: 'February 20, 2025',
    category: 'Tips & Advice',
    readTime: '5 min read',
    color: 'bg-amber-500',
  },
  {
    id: 5,
    title: 'Working While Studying in Australia: Rights and Regulations',
    excerpt:
      'Understand your work rights as an international student, including hour limits, tax obligations, and the best industries for part-time student employment.',
    date: 'February 12, 2025',
    category: 'Work & Study',
    readTime: '8 min read',
    color: 'bg-rose-500',
  },
  {
    id: 6,
    title: 'The Rise of Online and Hybrid Learning in Australian Universities',
    excerpt:
      'How Australian universities are blending on-campus and online learning, and what this means for international students considering flexible study options.',
    date: 'February 5, 2025',
    category: 'Education Trends',
    readTime: '6 min read',
    color: 'bg-cyan-500',
  },
];

const POSTS_PER_PAGE = 4;

export default function Blog() {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const handleLoadMore = () => {
    if (hasMore) {
      setVisibleCount((c) => Math.min(c + POSTS_PER_PAGE, posts.length));
    } else {
      toast('You have reached the end of the blog.', { icon: '📚' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">EduConnect Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Insights, guides, and stories to help you navigate your study
              journey in Australia.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow group"
              >
                {/* Image placeholder */}
                <div
                  className={`${post.color} h-48 flex items-center justify-center`}
                >
                  <BookOpen className="w-12 h-12 text-white/50" />
                </div>

                <div className="p-6">
                  {/* Category badge */}
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {post.category}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={handleLoadMore}
              className="bg-white text-slate-700 px-8 py-3 rounded-xl font-semibold border border-slate-300 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasMore}
            >
              {hasMore ? 'Load More Posts' : 'No more posts'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
