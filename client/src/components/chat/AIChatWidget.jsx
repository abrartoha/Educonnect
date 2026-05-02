import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
} from 'lucide-react';
import useStore from '../../store/useStore';

// ---------------------------------------------------------------------------
// AI Response Logic
// ---------------------------------------------------------------------------

function getAIResponse(message, universities) {
  const msg = message.toLowerCase().trim();

  // 1. Greetings
  if (/^(hi|hello|hey|howdy|g'day|greetings|sup|what's up)/i.test(msg)) {
    return (
      "Hello there! Welcome to EduConnect AI. I'm your personal education assistant for studying in Australia. I can help you with:\n\n" +
      "- Finding the right university\n" +
      "- Course & fee information\n" +
      "- Visa guidance\n" +
      "- Scholarships\n" +
      "- Connecting with verified agents\n\n" +
      "What would you like to know?"
    );
  }

  // 9. Ranking queries (before generic university match)
  if (/rank/i.test(msg)) {
    const sorted = [...universities]
      .filter((u) => u.status === 'active')
      .sort((a, b) => a.ranking - b.ranking);
    const list = sorted
      .map((u) => `  #${u.ranking} - ${u.name} (${u.location})`)
      .join('\n');
    return `Here are our partner universities sorted by QS World Ranking:\n\n${list}\n\nWould you like more details about any of these universities?`;
  }

  // 7. Location queries
  const locationMatch = msg.match(
    /\b(melbourne|sydney|brisbane|canberra|adelaide|perth|hobart|darwin)\b/i
  );
  if (locationMatch) {
    const loc = locationMatch[1].charAt(0).toUpperCase() + locationMatch[1].slice(1).toLowerCase();
    const matches = universities.filter(
      (u) =>
        u.status === 'active' &&
        u.location.toLowerCase().includes(loc.toLowerCase())
    );
    if (matches.length > 0) {
      const list = matches
        .map(
          (u) =>
            `  - ${u.name} (QS #${u.ranking}) - Tuition: $${u.tuitionRange.min.toLocaleString()}-$${u.tuitionRange.max.toLocaleString()} AUD/year`
        )
        .join('\n');
      return `Great choice! Here are universities in ${loc}:\n\n${list}\n\nWould you like more details about any of these, such as courses, scholarships, or entry requirements?`;
    }
    return `I don't have any partner universities listed in ${loc} at the moment, but new institutions are joining EduConnect regularly. Would you like to explore universities in other cities?`;
  }

  // 8. Specific course queries
  const courseKeywords = {
    engineering: 'Engineering',
    'computer science': 'IT',
    'it ': 'IT',
    'information technology': 'IT',
    cybersecurity: 'IT',
    business: 'Business',
    commerce: 'Business',
    finance: 'Business',
    mba: 'Business',
    medicine: 'Medicine',
    health: 'Health',
    nursing: 'Nursing',
    pharmacy: 'Pharmacy',
    law: 'Law',
    legal: 'Law',
    arts: 'Arts',
    humanities: 'Arts',
    science: 'Science',
    design: 'Design',
    architecture: 'Architecture',
    education: 'Education',
    psychology: 'Psychology',
    aviation: 'Aviation',
    film: 'Film',
    music: 'Music',
  };

  for (const [keyword, courseField] of Object.entries(courseKeywords)) {
    if (msg.includes(keyword)) {
      const matches = universities.filter(
        (u) =>
          u.status === 'active' &&
          u.courses.some((c) =>
            c.toLowerCase().includes(courseField.toLowerCase())
          )
      );
      if (matches.length > 0) {
        const list = matches
          .map(
            (u) =>
              `  - ${u.name} (QS #${u.ranking}, ${u.location}) - $${u.tuitionRange.min.toLocaleString()}-$${u.tuitionRange.max.toLocaleString()} AUD/year`
          )
          .join('\n');
        return `Here are universities offering ${courseField}-related courses:\n\n${list}\n\nEach university has different specialisations within ${courseField}. Would you like to know more about a specific program or compare options?`;
      }
    }
  }

  // 2. Generic university queries
  if (/universit|uni\b|course|study|program|degree/i.test(msg)) {
    const topUnis = [...universities]
      .filter((u) => u.status === 'active')
      .sort((a, b) => a.ranking - b.ranking)
      .slice(0, 4);
    const list = topUnis
      .map(
        (u) =>
          `  - ${u.name} (QS #${u.ranking}, ${u.location}) - Rating: ${u.rating}/5`
      )
      .join('\n');
    return `We have some excellent partner universities! Here are a few top-ranked options:\n\n${list}\n\nYou can ask me about specific courses, locations, fees, or scholarships. What interests you most?`;
  }

  // 3. Visa questions
  if (/visa/i.test(msg)) {
    return (
      "Great question about visas! Here's what you need to know about the Australian Student Visa (Subclass 500):\n\n" +
      "- You must be enrolled in a CRICOS-registered course\n" +
      "- Proof of sufficient funds (~$24,505 AUD/year for living costs)\n" +
      "- Overseas Student Health Cover (OSHC) is mandatory\n" +
      "- English language proficiency (IELTS 6.0+ for most courses)\n" +
      "- Genuine Temporary Entrant (GTE) requirement\n" +
      "- Processing time is typically 4-6 weeks\n\n" +
      "I recommend consulting a registered migration agent for personalised advice. Would you like me to help you find a verified agent on our platform?"
    );
  }

  // 4. Cost / fee / tuition queries
  if (/cost|fee|tuition|price|afford|budget|expens/i.test(msg)) {
    const activeUnis = universities.filter((u) => u.status === 'active');
    const allMins = activeUnis.map((u) => u.tuitionRange.min);
    const allMaxs = activeUnis.map((u) => u.tuitionRange.max);
    const overallMin = Math.min(...allMins);
    const overallMax = Math.max(...allMaxs);

    const feeList = activeUnis
      .map(
        (u) =>
          `  - ${u.name}: $${u.tuitionRange.min.toLocaleString()}-$${u.tuitionRange.max.toLocaleString()} AUD/year`
      )
      .join('\n');

    return (
      `Tuition fees for international students across our partner universities range from $${overallMin.toLocaleString()} to $${overallMax.toLocaleString()} AUD per year. Here's a breakdown:\n\n` +
      `${feeList}\n\n` +
      "Keep in mind living costs in Australia average $24,505 AUD/year. Many universities offer generous scholarships that can significantly reduce costs. Would you like to know about scholarship opportunities?"
    );
  }

  // 5. Scholarship queries
  if (/scholarship|financial aid|bursary|funding|grant/i.test(msg)) {
    const activeUnis = universities.filter((u) => u.status === 'active');
    const scholarshipList = activeUnis
      .map((u) => {
        const schols = u.scholarships.slice(0, 2).join(', ');
        return `  - ${u.name}: ${schols}`;
      })
      .join('\n');
    return (
      "There are many scholarship opportunities available! Here are some from our partner universities:\n\n" +
      `${scholarshipList}\n\n` +
      "Scholarships can range from partial tuition waivers to full rides covering tuition and living expenses. I recommend applying early as many have limited spots. Would you like details on a specific university's scholarship?"
    );
  }

  // 6. Agent / consultant queries
  if (/agent|consultant|advisor|counsellor|counselor|help me apply/i.test(msg)) {
    return (
      "EduConnect features a network of verified education agents and consultants who can guide you through the entire process:\n\n" +
      "- **Education Agents**: Help with university selection, applications, and visa guidance. All QEAC-certified.\n" +
      "- **Independent Consultants**: Specialists in areas like PhD applications, visa strategy, and career planning.\n\n" +
      "All our partners are verified and reviewed by real students. You can browse agents and consultants on the platform, read reviews, and book consultations directly.\n\n" +
      "Would you like me to help you find an agent specialising in a particular region or service?"
    );
  }

  // 10. Thank you / goodbye
  if (/thank|thanks|bye|goodbye|cheers/i.test(msg)) {
    return "You're welcome! If you have more questions in the future, I'm always here to help. Best of luck with your education journey in Australia!";
  }

  // 11. Help
  if (/help|what can you do|how does this work/i.test(msg)) {
    return (
      "I'm EduConnect AI, and I can assist you with:\n\n" +
      "- **University Search**: Find universities by location, ranking, or courses\n" +
      "- **Course Information**: Details on programs offered at partner universities\n" +
      "- **Fees & Costs**: Tuition ranges and living cost estimates\n" +
      "- **Scholarships**: Available funding opportunities\n" +
      "- **Visa Guidance**: Australian student visa information\n" +
      "- **Agent Matching**: Connect with verified education agents\n\n" +
      "Just type your question and I'll do my best to help!"
    );
  }

  // Default
  return "I can help with university selection, course information, visa guidance, scholarships, fees, and connecting with verified agents! Try asking about specific universities, courses, locations (like Melbourne or Sydney), fees, or scholarships.";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] sm:max-w-[75%]">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-2 h-2 rounded-full bg-slate-400"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  // Convert markdown-like bold (**text**) to <strong> and newlines to <br/>
  const formatContent = (text) => {
    const parts = text.split('\n');
    return parts.map((line, i) => {
      // Handle bold markdown
      const segments = line.split(/(\*\*[^*]+\*\*)/g);
      const formatted = segments.map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold">
              {seg.slice(2, -2)}
            </strong>
          );
        }
        return seg;
      });

      return (
        <span key={i}>
          {formatted}
          {i < parts.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-primary-500'
            : 'gradient-primary'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`px-4 py-2.5 max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
            : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md'
        }`}
      >
        {formatContent(message.content)}
      </div>
    </motion.div>
  );
}

function QuickReplies({ onSelect }) {
  const options = [
    'Find Universities',
    'Visa Info',
    'Compare Courses',
    'Find an Agent',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="flex flex-wrap gap-2 mb-4 pl-9"
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-colors cursor-pointer"
        >
          {opt}
        </button>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Widget
// ---------------------------------------------------------------------------

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm EduConnect AI, your personal education assistant. I can help you find the right university, understand visa requirements, compare courses, and connect with verified agents. What would you like to know?",
  timestamp: new Date(),
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasInitialised, setHasInitialised] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const universities = useStore((state) => state.universities);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Add welcome message on first open
  const handleOpen = () => {
    if (!hasInitialised) {
      setMessages([WELCOME_MESSAGE]);
      setHasInitialised(true);
    }
    setHasNewMessage(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setIsTyping(false);
  };

  // Send message
  const handleSend = useCallback(
    (text) => {
      const content = (text || input).trim();
      if (!content || isTyping) return;

      const userMsg = {
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      // Simulate AI thinking delay
      const delay = 500 + Math.random() * 1000;
      setTimeout(() => {
        const aiContent = getAIResponse(content, universities);
        const aiMsg = {
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);

        // Badge if chat is closed
        if (!isOpen) {
          setHasNewMessage(true);
        }
      }, delay);
    },
    [input, isTyping, universities, isOpen]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  // Check if we should show quick replies (only after the initial welcome, before user sends)
  const showQuickReplies =
    messages.length === 1 && messages[0].role === 'assistant';

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
            aria-label="Open chat"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full gradient-primary animate-ping opacity-20" />
            <MessageCircle className="w-6 h-6 relative z-10" />

            {/* Unread badge */}
            {hasNewMessage && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
              >
                !
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] h-full sm:h-[520px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/60"
          >
            {/* Header */}
            <div className="gradient-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">
                    EduConnect AI
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white/70 text-xs">
                      Always online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/70 hover:text-white cursor-pointer"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/70 hover:text-white cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-0"
            >
              {/* Powered by badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Powered by EduConnect AI
                </span>
              </div>

              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}

              {showQuickReplies && <QuickReplies onSelect={handleQuickReply} />}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-slate-100 px-3 py-3">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    input.trim() && !isTyping
                      ? 'gradient-primary text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:scale-105 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
