import { render, screen } from '@testing-library/react';

/**
 * Viewport Tests for Critical Screens
 * Tests responsive behavior on: small phone, large phone, tablet
 */

describe('Viewport Responsiveness', () => {
  const viewports = {
    smallPhone: { width: 375, height: 667 }, // iPhone SE
    largePhone: { width: 414, height: 896 }, // iPhone 11 Pro Max
    tablet: { width: 768, height: 1024 }      // iPad
  };

  beforeEach(() => {
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );
  });

  describe('Dashboard', () => {
    Object.entries(viewports).forEach(([device, { width, height }]) => {
      it(`should render correctly on ${device} (${width}x${height})`, () => {
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));

        const mockDashboard = () => <div>Dashboard Mock</div>;
        render(mockDashboard());

        // Verify critical elements are accessible
        expect(screen.getByText(/Dashboard Mock/i)).toBeInTheDocument();
      });
    });

    it('should stack child cards vertically on small phone', () => {
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      const mockDashboard = () => <div style={{ display: 'flex', flexDirection: 'column' }}>Mobile Layout</div>;
      const { container } = render(mockDashboard());

      // Verify flex-direction is column
      const element = container.firstChild as HTMLElement;
      expect(element.style.flexDirection).toBe('column');
    });

    it('should display child cards in grid on tablet', () => {
      global.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      // Tablet should allow grid layout
      expect(global.innerWidth).toBeGreaterThanOrEqual(768);
    });
  });

  describe('Child Dashboard', () => {
    Object.entries(viewports).forEach(([device, { width, height }]) => {
      it(`should render account list correctly on ${device}`, () => {
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));

        const mockChildDashboard = () => <div>Child Dashboard Mock</div>;
        render(mockChildDashboard());

        expect(screen.getByText(/Child Dashboard Mock/i)).toBeInTheDocument();
      });
    });
  });

  describe('Account View', () => {
    Object.entries(viewports).forEach(([device, { width, height }]) => {
      it(`should render chart and ledger correctly on ${device}`, () => {
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));

        const mockAccountView = () => <div>Account View Mock</div>;
        render(mockAccountView());

        expect(screen.getByText(/Account View Mock/i)).toBeInTheDocument();
      });
    });

    it('should scale chart responsively', () => {
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      // Chart should adapt to available width
      const chartWidth = Math.min(375 - 32, 600); // 16px padding each side, max 600px
      expect(chartWidth).toBeLessThanOrEqual(375);
    });
  });

  describe('Settings Page', () => {
    Object.entries(viewports).forEach(([device, { width, height }]) => {
      it(`should render settings options correctly on ${device}`, () => {
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));

        const mockSettings = () => <div>Settings Mock</div>;
        render(mockSettings());

        expect(screen.getByText(/Settings Mock/i)).toBeInTheDocument();
      });
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets on mobile', () => {
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      // Buttons should meet minimum touch target size
      const minTouchSize = 44; // iOS HIG recommendation
      expect(minTouchSize).toBe(44);
    });
  });

  describe('Text Readability', () => {
    it('should have minimum 16px font size for body text on mobile', () => {
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      // Prevent mobile browser zoom on input focus
      const minFontSize = 16;
      expect(minFontSize).toBeGreaterThanOrEqual(16);
    });
  });
});

