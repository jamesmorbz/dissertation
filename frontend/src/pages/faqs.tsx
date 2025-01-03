import { useState, useMemo } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { Separator } from '@/components/ui/separator';
import { FlipCard } from '@/components/faq/flip-card';
import { FAQItem } from '@/types/faq';
import { SearchBar } from '@/components/faq/search-bar';
import { Footer } from '@/components/faq/footer';

const faqs: FAQItem[] = [
  {
    question: "What's the point of reducing my household's carbon footprint?",
    answer:
      'Reducing your carbon footprint helps combat climate change by minimizing greenhouse gas emissions. Small actions at the household level can lead to significant environmental benefits.',
    tags: ['sustainability', 'environment', 'carbon'],
  },
  {
    question: 'How do smart plugs help manage electricity usage?',
    answer:
      'Smart plugs provide granular, plug-level energy consumption data, unlike traditional smart meters, which lack detailed insights. They enable real-time monitoring, automated scheduling, and energy-saving recommendations.',
    tags: ['smart plugs', 'energy management', 'automation'],
  },
  {
    question: 'Why should I try to reduce my energy consumption?',
    answer:
      'Reducing energy consumption saves money, supports a cleaner energy grid, and contributes to global sustainability efforts.',
    tags: ['energy efficiency', 'cost savings', 'sustainability'],
  },
  {
    question: 'How do plugs consume electricity even when devices are off?',
    answer:
      "Many devices draw 'phantom' or 'standby' power even when turned off. Smart plugs can help identify and eliminate these hidden energy drains.",
    tags: ['electricity', 'phantom power', 'smart plugs'],
  },
  {
    question:
      'Are traditional smart meters not enough for managing energy use?',
    answer:
      'Smart meters provide basic point-in-time energy data but lack granular insights and forecasting. They do not equip users with actionable tools for energy optimization.',
    tags: ['smart meters', 'energy optimization', 'limitations'],
  },
  {
    question: 'What is carbon intensity, and why does it matter?',
    answer:
      'Carbon intensity measures the CO₂ emissions per kilowatt-hour of electricity. Timing energy use during low-carbon periods reduces environmental impact.',
    tags: ['carbon intensity', 'sustainability', 'environment'],
  },
  {
    question: 'How can your system help me save on electricity costs?',
    answer:
      'Our system integrates smart plug data with energy tariffs and carbon intensity metrics to provide personalized recommendations for reducing costs and emissions.',
    tags: ['cost savings', 'energy tariffs', 'smart plugs'],
  },
  {
    question: 'Is it difficult to set up and use your system?',
    answer:
      'No, the system is designed for ease of use with a minimal onboarding process and a user-friendly interface.',
    tags: ['usability', 'setup', 'energy management'],
  },
  {
    question: 'How do carbon intensity forecasts help reduce emissions?',
    answer:
      'Carbon intensity forecasts allow users to align energy use with low-carbon periods, reducing emissions without additional energy use.',
    tags: ['carbon intensity', 'forecasts', 'sustainability'],
  },
  {
    question: "What's wrong with current smart home solutions?",
    answer:
      'Many smart home systems are expensive, require technical expertise, and lack features like energy forecasting or plug-level insights.',
    tags: ['smart homes', 'limitations', 'energy forecasting'],
  },
  {
    question: 'Why do energy costs fluctuate so much?',
    answer:
      'Energy costs depend on supply and demand. Weather, geopolitical events, and infrastructure maintenance influence pricing.',
    tags: ['energy costs', 'tariffs', 'fluctuations'],
  },
  {
    question: 'Can your system work offline?',
    answer:
      'Yes, it stores usage data locally during connectivity loss and synchronizes it with the cloud once restored.',
    tags: ['offline mode', 'data management', 'connectivity'],
  },
  {
    question: 'How does your system compare to HomeAssistant?',
    answer:
      'Our system prioritizes ease of use and advanced analytics, offering energy optimization features HomeAssistant lacks.',
    tags: ['HomeAssistant', 'comparison', 'analytics'],
  },
  {
    question: 'What kind of data does your system collect?',
    answer:
      'The system collects energy usage, carbon intensity, and energy tariff data to provide actionable insights and recommendations.',
    tags: ['data collection', 'energy', 'smart plugs'],
  },
  {
    question: 'How does your system protect my data?',
    answer:
      'All communications are encrypted with TLS, sensitive data is securely stored, and strict access controls are enforced.',
    tags: ['security', 'encryption', 'data protection'],
  },
  {
    question: 'Can I control my smart plugs remotely?',
    answer:
      'Yes, our system allows remote control, enabling you to manage devices and set automation rules from anywhere.',
    tags: ['remote control', 'smart plugs', 'automation'],
  },
  {
    question: 'How does the system recommend energy-saving actions?',
    answer:
      'It analyzes usage patterns and integrates carbon intensity and tariff data to suggest optimal appliance usage times.',
    tags: ['recommendations', 'energy savings', 'optimization'],
  },
  {
    question: "What's the role of automation in energy efficiency?",
    answer:
      'Automation simplifies energy management by letting you schedule devices based on triggers, reducing waste effortlessly.',
    tags: ['automation', 'energy efficiency', 'scheduling'],
  },
];

export function FAQs() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <Separator />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h1>

        <div className="max-w-md mx-auto mb-8">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          {filteredFaqs.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              No FAQs found matching your search.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFaqs.map((faq: FAQItem, index: number) => (
            <FlipCard key={index} {...faq} index={index} />
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}
