import React, { useState } from 'react';
import { AnimatedGradientText } from '../components/ui/animated-gradient-text';
import { MagicCard } from '../components/ui/magic-card';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { TextReveal } from '../components/ui/text-reveal';
import { WordRotate } from '../components/ui/word-rotate';

const categories = [
  {
    id: 1,
    title: 'E-Waste Basics',
    description: 'Learn about different types of electronic waste and their impact on the environment.',
    articles: [
      {
        id: 'eb1',
        title: 'What is E-Waste?',
        content: 'Electronic waste, or e-waste, refers to discarded electronic devices...',
        readTime: '5 min'
      },
      {
        id: 'eb2',
        title: 'Common Types of E-Waste',
        content: 'The most common types of e-waste include computers, smartphones...',
        readTime: '7 min'
      },
      {
        id: 'eb3',
        title: 'Environmental Impact',
        content: 'E-waste contains toxic materials that can harm the environment...',
        readTime: '6 min'
      }
    ]
  },
  {
    id: 2,
    title: 'Proper Disposal Methods',
    description: 'Discover the right ways to dispose of different electronic devices.',
    articles: [
      {
        id: 'pd1',
        title: 'Safe Disposal Guidelines',
        content: 'Follow these steps to safely dispose of your electronic devices...',
        readTime: '8 min'
      },
      {
        id: 'pd2',
        title: 'Recycling Process',
        content: 'Understanding how electronics are recycled and processed...',
        readTime: '10 min'
      }
    ]
  },
  {
    id: 3,
    title: 'Sustainability Tips',
    description: 'Learn how to reduce e-waste through sustainable practices.',
    articles: [
      {
        id: 'st1',
        title: 'Extending Device Lifespan',
        content: 'Tips and tricks to make your electronics last longer...',
        readTime: '6 min'
      },
      {
        id: 'st2',
        title: 'Repair vs Replace',
        content: 'When to repair your devices and when to replace them...',
        readTime: '7 min'
      }
    ]
  }
];

const LearnPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedGradientText>
            Learn About E-Waste Management
          </AnimatedGradientText>
          <WordRotate
            className="text-xl text-gray-400 mt-4"
            words={['Educate', 'Understand', 'Act', 'Impact']}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <MagicCard
              key={category.id}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <TextReveal>
                <h2 className="text-2xl font-bold text-white mb-3">{category.title}</h2>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <div className="space-y-2">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArticle(article);
                      }}
                    >
                      <h3 className="text-white font-medium">{article.title}</h3>
                      <p className="text-sm text-gray-400">{article.readTime} read</p>
                    </div>
                  ))}
                </div>
              </TextReveal>
            </MagicCard>
          ))}
        </div>

        {/* Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <MagicCard className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedArticle.title}</h2>
                <ShimmerButton
                  onClick={() => setSelectedArticle(null)}
                  className="!px-3 !py-1"
                >
                  Close
                </ShimmerButton>
              </div>
              <p className="text-gray-400 mb-2">{selectedArticle.readTime} read</p>
              <p className="text-gray-300 whitespace-pre-line">{selectedArticle.content}</p>
            </MagicCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPage; 