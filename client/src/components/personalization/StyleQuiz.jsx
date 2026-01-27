/**
 * Style Quiz Component
 * Multi-step quiz to determine user style preferences
 * Saves answers to user preferences via API
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

// Quiz Questions
const QUESTIONS = [
  {
    id: 'style',
    question: 'Which style resonates with you most?',
    options: [
      { value: 'minimalist', label: 'Minimalist', description: 'Clean lines, neutral colors, timeless pieces', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop' },
      { value: 'classic', label: 'Classic', description: 'Tailored fits, traditional patterns, refined elegance', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop' },
      { value: 'streetwear', label: 'Streetwear', description: 'Bold graphics, relaxed fits, urban influence', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop' },
      { value: 'elegant', label: 'Elegant', description: 'Luxurious fabrics, sophisticated silhouettes', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=300&fit=crop' },
    ],
  },
  {
    id: 'colorPalette',
    question: 'What color palette do you gravitate towards?',
    options: [
      { value: 'neutrals', label: 'Neutrals', description: 'Black, white, grey, beige', colors: ['#1A1A1A', '#FAFAFA', '#9E9E9E', '#D3C4A5'] },
      { value: 'earth', label: 'Earth Tones', description: 'Browns, olives, terracotta', colors: ['#C19A6B', '#556B2F', '#9A463D', '#C2B280'] },
      { value: 'deep', label: 'Deep & Rich', description: 'Navy, burgundy, forest green', colors: ['#1B2838', '#722F37', '#228B22', '#191970'] },
      { value: 'bold', label: 'Bold Accents', description: 'Pops of color with neutral base', colors: ['#1A1A1A', '#FAFAFA', '#10B981', '#6366F1'] },
    ],
  },
  {
    id: 'fit',
    question: 'What fit do you prefer?',
    options: [
      { value: 'slim', label: 'Slim Fit', description: 'Tailored close to the body' },
      { value: 'regular', label: 'Regular Fit', description: 'Classic, comfortable fit' },
      { value: 'relaxed', label: 'Relaxed Fit', description: 'Loose, comfortable silhouettes' },
      { value: 'oversized', label: 'Oversized', description: 'Intentionally larger proportions' },
    ],
  },
  {
    id: 'priority',
    question: "What's most important in your wardrobe?",
    options: [
      { value: 'quality', label: 'Quality', description: 'Premium materials that last' },
      { value: 'versatility', label: 'Versatility', description: 'Pieces that work multiple ways' },
      { value: 'statement', label: 'Statement', description: 'Unique pieces that stand out' },
      { value: 'comfort', label: 'Comfort', description: 'Easy-wearing everyday pieces' },
    ],
  },
  {
    id: 'size',
    question: 'What is your typical size?',
    options: [
      { value: 'XS', label: 'XS', description: 'Extra Small' },
      { value: 'S', label: 'S', description: 'Small' },
      { value: 'M', label: 'M', description: 'Medium' },
      { value: 'L', label: 'L', description: 'Large' },
      { value: 'XL', label: 'XL', description: 'Extra Large' },
      { value: 'XXL', label: 'XXL', description: 'Double XL' },
    ],
  },
];

export function StyleQuiz({ onComplete, onClose }) {
  const { updatePreferences, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelect = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const preferences = {
      favoriteStyle: answers.style,
      colorPalette: answers.colorPalette,
      preferredFit: answers.fit,
      wardrobePriority: answers.priority,
      preferredSize: answers.size,
      hasCompletedQuiz: true,
      quizCompletedAt: new Date().toISOString(),
    };

    const result = await updatePreferences(preferences);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.(preferences);
      }, 2000);
    }
  };

  const isAnswered = answers[currentQuestion?.id];

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-serif text-zinc-100 mb-2">
          Your Style Profile is Ready!
        </h3>
        <p className="text-zinc-400 max-w-md">
          We&apos;ll now personalize your shopping experience based on your preferences.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Style Quiz</span>
        </div>
        <h2 className="text-2xl font-serif text-zinc-100">
          Discover Your Perfect Style
        </h2>
        <p className="text-zinc-400 mt-2">
          Answer a few questions to personalize your experience
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-zinc-500 mb-2">
            Question {currentStep + 1} of {QUESTIONS.length}
          </p>
          <h3 className="text-xl font-medium text-zinc-100 mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div className={cn(
            'grid gap-4',
            currentQuestion.options.length > 4 ? 'grid-cols-3' : 'grid-cols-2'
          )}>
            {currentQuestion.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500',
                  answers[currentQuestion.id] === option.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                )}
              >
                {/* Image (if exists) */}
                {option.image && (
                  <div className="aspect-[4/3] rounded-md overflow-hidden mb-3">
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Color Swatches (if exists) */}
                {option.colors && (
                  <div className="flex gap-2 mb-3">
                    {option.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border border-zinc-600"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                {/* Label */}
                <p className={cn(
                  'font-medium',
                  answers[currentQuestion.id] === option.value
                    ? 'text-emerald-400'
                    : 'text-zinc-100'
                )}>
                  {option.label}
                </p>

                {/* Description */}
                {option.description && (
                  <p className="text-sm text-zinc-400 mt-1">
                    {option.description}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onClose : handleBack}
          className="border-zinc-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isAnswered || isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isSubmitting ? (
            'Saving...'
          ) : currentStep === QUESTIONS.length - 1 ? (
            <>
              Complete
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default StyleQuiz;
