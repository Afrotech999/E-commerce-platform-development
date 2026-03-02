import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

const CONTENT: Record<string, { title: string; body: string }> = {
  'contact-us': {
    title: 'Contact Us',
    body: 'Get in touch with our team. Email: info@doka.com | Phone: +251 11 123 4567. We typically respond within 24 hours.',
  },
  'shipping-returns': {
    title: 'Shipping & Returns',
    body: 'We offer standard and express shipping. Most orders ship within 2–3 business days. Returns are accepted within 30 days of delivery for unused items in original packaging. Contact support to initiate a return.',
  },
  'faq': {
    title: 'FAQ',
    body: 'Common questions: How do I track my order? You will receive a tracking link by email. What payment methods do you accept? We accept major cards and mobile money. Do you ship internationally? Yes, to selected countries. For more, email info@doka.com.',
  },
  warranty: {
    title: 'Warranty',
    body: 'Our products come with a standard 2-year warranty covering manufacturing defects. Register your product after purchase to activate. Warranty does not cover accidental damage or misuse. Extended warranty options are available at checkout.',
  },
  'about-us': {
    title: 'About Us',
    body: 'ClickSuq is your destination for premium technology and lifestyle products. We curate quality devices and accessories to help you stay connected and productive. Founded with a focus on customer experience and authenticity.',
  },
  careers: {
    title: 'Careers',
    body: 'Join the ClickSuq team. We are always looking for talented people in sales, marketing, and operations. Send your resume to careers@doka.com with the subject line "Application – [Role]". We review applications on a rolling basis.',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: 'We collect only the information necessary to process orders and improve your experience. We do not sell your data. Payment details are handled by secure providers. You can request access or deletion of your data by contacting info@doka.com.',
  },
  'terms-of-service': {
    title: 'Terms of Service',
    body: 'By using ClickSuq you agree to these terms. Products are subject to availability. We reserve the right to correct pricing errors. Limitation of liability applies as permitted by law. Governing law: Ethiopia. For full terms, contact legal@doka.com.',
  },
};

interface FooterContentModalProps {
  slug: string | null;
  onClose: () => void;
}

export function FooterContentModal({ slug, onClose }: FooterContentModalProps) {
  const content = slug ? CONTENT[slug] : null;

  return (
    <Dialog open={!!slug} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border border-gray-200/60 shadow-2xl shadow-black/15 bg-white/95 backdrop-blur-xl">
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gray-400/50 to-transparent rounded-t-2xl shrink-0" />

        <DialogHeader className="relative shrink-0 px-8 sm:px-10 pt-8 pb-5 border-b border-gray-200/60 bg-gray-50/40">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 h-9 w-9 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 pr-12 text-left">
            {content?.title ?? 'Info'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 sm:px-10 py-6 sm:py-8">
          <p className="text-[15px] sm:text-base text-gray-600 leading-[1.7] text-left max-w-none">
            {content?.body ?? ''}
          </p>
        </div>

        {/* <div className="shrink-0 px-8 sm:px-10 py-5 border-t border-gray-200/60 bg-gray-50/30 rounded-b-2xl flex justify-end">
          <Button
            variant="outline"
            className="min-w-[100px] border-gray-300 hover:bg-gray-100 font-medium text-gray-700"
            onClick={onClose}
          >
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
