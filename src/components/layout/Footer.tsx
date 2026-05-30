import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center mb-4">
              <Logo className="text-white" />
              <span className="ml-2 text-xl font-bold">Faith Amplifiers</span>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering Christians worldwide with gospel news, events, and professional services to amplify your faith journey.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://facebook.com" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://twitter.com" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://instagram.com" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://youtube.com" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </SocialLink>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/news">Latest News</FooterLink>
              <FooterLink to="/events">Upcoming Events</FooterLink>
              <FooterLink to="/services">Our Services</FooterLink>
              <FooterLink to="/directory">Business Directory</FooterLink>
              <FooterLink to="/resources">Resources</FooterLink>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <FooterLink to="/services/livestreaming">Livestreaming</FooterLink>
              <FooterLink to="/services/graphics-design">Graphics Design</FooterLink>
              <FooterLink to="/services/video-coverage">Video Coverage</FooterLink>
              <FooterLink to="/services/event-production">Event Production</FooterLink>
              <FooterLink to="/services/request-quote">Request a Quote</FooterLink>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-secondary" />
                <span>info@faithamplifiers.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-secondary" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/contact" className="btn btn-secondary">
                Send Message
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-700 text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {currentYear} Faith Amplifiers. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer link component
const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => (
  <li>
    <Link
      to={to}
      className="text-gray-300 hover:text-secondary transition-colors"
    >
      {children}
    </Link>
  </li>
);

// Social media link component
const SocialLink: React.FC<{
  href: string;
  'aria-label': string;
  children: React.ReactNode;
}> = ({ href, 'aria-label': ariaLabel, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="bg-primary-light hover:bg-secondary hover:text-primary p-2 rounded-full transition-colors"
  >
    {children}
  </a>
);

export default Footer;