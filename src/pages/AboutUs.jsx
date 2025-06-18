import React from 'react';
import { MagicCard } from '../components/ui/magic-card';

const AboutUs = () => {
  const stats = [
    { number: '50,000+', label: 'Devices Recycled', icon: '♻️' },
    { number: '25,000kg', label: 'CO2 Emissions Saved', icon: '🌱' },
    { number: '500+', label: 'Partner Centers', icon: '🏢' },
    { number: '15,000+', label: 'Happy Users', icon: '👥' }
  ];

  const values = [
    {
      title: 'Environmental Impact',
      description: 'We\'re committed to reducing e-waste and creating a circular economy where technology serves both people and planet.',
      icon: '🌍',
      details: ['Zero landfill policy', 'Carbon-neutral operations', 'Sustainable partnerships']
    },
    {
      title: 'Community First',
      description: 'Building connections between individuals, businesses, and recycling centers to create lasting environmental change.',
      icon: '🤝',
      details: ['Local partnerships', 'Educational programs', 'Accessible recycling']
    },
    {
      title: 'Innovation & Technology',
      description: 'Leveraging cutting-edge technology to make recycling effortless, transparent, and rewarding for everyone.',
      icon: '💡',
      details: ['Smart matching system', 'Real-time tracking', 'Data-driven insights']
    },
    {
      title: 'Transparency',
      description: 'Every step of the recycling process is tracked and verified, ensuring your e-waste is handled responsibly.',
      icon: '🔍',
      details: ['Full process visibility', 'Certified partners', 'Impact reporting']
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      image: 'https://i.pravatar.cc/150?img=5',
      bio: 'Environmental engineer with 12+ years in sustainability. Former Tesla sustainability lead.',
      linkedin: '#'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Operations',
      image: 'https://i.pravatar.cc/150?img=8',
      bio: 'Logistics expert specializing in reverse supply chains and circular economy solutions.',
      linkedin: '#'
    },
    {
      name: 'Emma Thompson',
      role: 'Community Director',
      image: 'https://i.pravatar.cc/150?img=3',
      bio: 'Community builder passionate about environmental education and sustainable behavior change.',
      linkedin: '#'
    },
    {
      name: 'David Kim',
      role: 'CTO',
      image: 'https://i.pravatar.cc/150?img=12',
      bio: 'Full-stack developer focused on creating scalable, efficient platforms for environmental impact.',
      linkedin: '#'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'Started with a vision to revolutionize e-waste recycling' },
    { year: '2021', title: 'First 100 Partners', description: 'Onboarded our first recycling center partners' },
    { year: '2022', title: 'Mobile App Launch', description: 'Made recycling accessible on-the-go' },
    { year: '2023', title: 'Carbon Neutral', description: 'Achieved carbon neutrality across all operations' },
    { year: '2024', title: 'National Expansion', description: 'Expanded to serve communities nationwide' }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section - Clean and Direct */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Building a Sustainable Future,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              One Device at a Time
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            EcoTech connects communities with certified recycling centers, making responsible 
            e-waste disposal simple, transparent, and rewarding. Together, we're creating a 
            circular economy where technology waste becomes a resource 
            for sustainable innovation."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
              Start Recycling Today
            </button>
            <button className="px-8 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 font-semibold rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Environmental Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.number}</div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <MagicCard className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              "To revolutionize e-waste recycling by creating an accessible, transparent, and 
              rewarding platform that connects communities with certified recycling centers, 
              ultimately building a circular economy where technology waste becomes a resource 
              for sustainable innovation."
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-300">
              <span className="px-4 py-2 bg-emerald-500/20 rounded-full">Circular Economy</span>
              <span className="px-4 py-2 bg-emerald-500/20 rounded-full">Zero Waste</span>
              <span className="px-4 py-2 bg-emerald-500/20 rounded-full">Community Impact</span>
              <span className="px-4 py-2 bg-emerald-500/20 rounded-full">Technology for Good</span>
            </div>
          </MagicCard>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">What Drives Us</h2>
          <p className="text-slate-300 text-center mb-16 max-w-2xl mx-auto">
            Our values guide every decision we make and every partnership we form
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <MagicCard key={index} className="p-8 h-full">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl flex-shrink-0">{value.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-slate-300 mb-4 leading-relaxed">{value.description}</p>
                    <ul className="space-y-2">
                      {value.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-emerald-300 flex items-center">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Our Journey</h2>
          <p className="text-slate-300 text-center mb-16">
            From startup to sustainability leader - here's how we're changing the world
          </p>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                    <span className="text-emerald-400 font-semibold">{milestone.year}</span>
                  </div>
                  <p className="text-slate-300">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Meet Our Team</h2>
          <p className="text-slate-300 text-center mb-16 max-w-2xl mx-auto">
            Passionate professionals dedicated to creating a sustainable future through innovation and community
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <MagicCard key={index} className="p-6 text-center h-full">
                <div className="mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-emerald-500"
                  />
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-emerald-400 font-semibold mb-3">{member.role}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{member.bio}</p>
                </div>
                <a 
                  href={member.linkedin}
                  className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  Connect
                </a>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <MagicCard className="bg-gradient-to-r from-emerald-900/50 to-teal-900/30 p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of environmentally conscious individuals and businesses who are 
              already making a difference through responsible e-waste recycling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
                Find Recycling Centers
              </button>
              <button className="px-8 py-3 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white font-semibold rounded-lg transition-colors">
                Schedule a Pickup
              </button>
            </div>
          </MagicCard>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
              <p className="text-slate-300">hello@ecotech.com</p>
              <p className="text-slate-300">support@ecotech.com</p>
            </div>
            <div>
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
              <p className="text-slate-300">1-800-ECO-TECH</p>
              <p className="text-slate-300">Mon-Fri: 9AM-6PM PST</p>
            </div>
            <div>
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Visit Us</h3>
              <p className="text-slate-300">123 Green Street</p>
              <p className="text-slate-300">Seattle, WA 98101</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs; 