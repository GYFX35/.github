// src/pages/SponsorshipPage.jsx
import React, { useEffect, useRef } from 'react'; // Add useEffect, useRef
import { Helmet } from 'react-helmet-async';
import { mockSponsorshipTiers } from '../data/mockSponsorshipTiers';
import SponsorDisplay from '../components/SponsorDisplay';
import './SponsorshipPage.css';

function SponsorshipPage() {
  // Refs for Google Pay button containers
  const googlePayButtonContainers = useRef([]);
  // Ensure refs array is populated correctly based on number of tiers
  if (googlePayButtonContainers.current.length !== mockSponsorshipTiers.length) {
    googlePayButtonContainers.current = Array(mockSponsorshipTiers.length).fill().map((_, i) => googlePayButtonContainers.current[i] || React.createRef());
  }

  const onGooglePayButtonClicked = (tier) => {
    console.log(`Google Pay button clicked for tier: ${tier.name}`);
    alert(`Payment processing for ${tier.name} via Google Pay would be handled here by integrating with your backend and the Google Pay API. This is currently a UI placeholder.`);
    // In a real implementation, you would:
    // 1. Create a payment request object with tier details.
    // 2. Call paymentsClient.loadPaymentData(paymentRequest).
    // 3. Send the payment token from Google Pay to your backend for processing.
  };

  // Placeholder: Simulates Google Pay button initialization.
  // Actual Google Pay button integration is more complex and involves their client library.
  const initializeGooglePayButton = (tier, index) => {
    const buttonContainer = googlePayButtonContainers.current[index]?.current;
    if (buttonContainer) {
        // This is where you would use the Google Pay API to create a button
        // For now, we just make our placeholder clickable and look like a button.
        // The actual Google Pay button renders itself into the container.
        console.log(`Placeholder: Google Pay button for "${tier.name}" would be initialized here in container:`, buttonContainer);
        // We will keep the existing button style but make it clear it's a GPay placeholder
    }
  };

  useEffect(() => {
    // Check if Google Pay API is loaded (optional, good practice)
    if (window.google && window.google.payments && window.google.payments.api) {
      console.log("Google Pay API script loaded.");
      // This is where you would typically initialize the PaymentsClient
      // const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });
      // And then for each button:
      mockSponsorshipTiers.forEach((tier, index) => {
        initializeGooglePayButton(tier, index);
      });
    } else {
      console.warn("Google Pay API script not loaded yet or failed to load. Google Pay buttons might not render/function.");
    }
  }, []); // Run once on mount


  return (
    <div className="sponsorship-page">
      <Helmet>
        <title>Become a Sponsor - Customer Magazine App</title>
        <meta name="description" content="Support Customer Magazine App by becoming a sponsor. Explore our sponsorship tiers and benefits." />
      </Helmet>

      <header className="sponsorship-header">
        <h1>Sponsor Our Magazine</h1>
        <p>Support our mission and connect with our engaged audience by becoming a sponsor. We offer several tiers to fit your goals.</p>
      </header>

      <div className="sponsorship-tiers-container">
        {mockSponsorshipTiers.map((tier, index) => (
          <div key={tier.id} className="sponsorship-tier-card">
            <h2>{tier.name}</h2>
            <p className="tier-price">
              ${tier.pricePerMonth}/month or ${tier.priceAnnual}/year ({tier.currency})
            </p>
            <p className="tier-description">{tier.description}</p>
            <h3>Benefits:</h3>
            <ul className="tier-benefits">
              {tier.benefits.map((benefit, benefitIndex) => (
                <li key={benefitIndex}>{benefit}</li>
              ))}
            </ul>
            {/* Replace button with a div container for GPay button and a styled placeholder */}
            <div
              ref={googlePayButtonContainers.current[index]}
              className="google-pay-button-container"
              style={{textAlign: 'center', marginTop: 'auto'}}
            >
               {/* This is a placeholder button that SIMULATES what a GPay button might do on click */}
               {/* The actual GPay button would be rendered by Google's script into this div */}
              <button
                className="google-pay-button-placeholder" // Keep existing class for styling
                onClick={() => onGooglePayButtonClicked(tier)}
                aria-label={`Sponsor ${tier.name} with Google Pay`}
              >
                {tier.cta} with Google Pay
              </button>
            </div>
          </div>
        ))}
      </div>

      <SponsorDisplay title="Meet Our Current Sponsors" />

      <section className="sponsorship-contact" style={{marginTop: '40px', textAlign: 'center'}}>
        <h3>Have Questions or Custom Requests?</h3>
        <p>We'd love to hear from you! Please <a href="mailto:sponsorship@example.com">contact us</a> for more information or custom sponsorship packages.</p>
      </section>
    </div>
  );
}

export default SponsorshipPage;
