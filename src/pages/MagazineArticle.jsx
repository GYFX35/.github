// src/pages/MagazineArticle.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom'; // Import Link
import mockArticles from '../data/mockArticles'; // Import mock articles

// Accept new props
function MagazineArticle({ openChatbot, sendMessageToBot }) {
  const { slug } = useParams(); // Now using slug
  const article = mockArticles.find(art => art.slug === slug);

  // Default content if article not found
  let pageTitle = "Article Not Found - Customer Magazine App";
  let pageDescription = "The article you are looking for could not be found.";
  let articleDisplayContent = ( // Renamed from articleDisplay to avoid conflict
    <div>
      <h1>Article Not Found</h1>
      <p>The article you are looking for could not be found. Please check the URL or <Link to="/magazine">go back to the magazine home</Link>.</p>
    </div>
  );

  const handleSummarizeClick = () => {
    if (!article) return;

    if (openChatbot) {
      openChatbot();
    }

    if (sendMessageToBot) {
      const summaryRequestMessage = `Tell me about the article: "${article.title}"`; // User-friendly request
      sendMessageToBot(summaryRequestMessage, 'summarize_article', {
        title: article.title,
        slug: article.slug,
        // Pass a snippet or key points if full content is too long for a mock prompt.
        // For a real backend, you'd just send the slug/ID.
        contentSnippet: article.excerpt || article.content.substring(0, 200) + "..."
      });
    } else {
      console.error("Chatbot interaction functions not passed to MagazineArticle component.");
      alert("Chatbot interaction is currently unavailable.");
    }
  };

  if (article) {
    pageTitle = `${article.title} - Customer Magazine App`;
    // Using excerpt for meta description, or you could generate one from content
    pageDescription = article.excerpt || article.title;

    articleDisplayContent = (
      <>
        <h1>{article.title}</h1>
        {sendMessageToBot && openChatbot && ( // Only show button if functions are available
          <button onClick={handleSummarizeClick} style={{
            padding: '8px 12px',
            margin: '10px 0 20px 0',
            cursor: 'pointer',
            backgroundColor: '#6c757d', // A different color
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}>
            🤖 Ask AI about this Article
          </button>
        )}
        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            style={{ width: '100%', maxWidth: '700px', height: 'auto', marginBottom: '20px', borderRadius: '5px' }}
          />
        )}
        {/* Render HTML content from mock data. Ensure this HTML is trusted/sanitized in a real app. */}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

        {article.isGuestPost && (
          <div className="guest-author-section" style={{
            marginTop: '40px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            clear: 'both' // In case author image used float
          }}>
            <h3 style={{ marginTop: '0', marginBottom: '15px' }}>About the Guest Author</h3>
            {article.authorImage && (
              <img
                src={article.authorImage}
                alt={article.authorName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  float: 'left',
                  marginRight: '20px',
                  marginBottom: '10px'
                }}
              />
            )}
            <div style={{ overflow: 'hidden' }}> {/* To contain floats if authorImage is floated */}
              <p style={{ fontWeight: 'bold', fontSize: '1.1em', margin: '0 0 5px 0' }}>{article.authorName}</p>
              {article.authorBio && <p style={{ fontSize: '0.9em', margin: '0 0 10px 0' }}>{article.authorBio}</p>}
              {article.authorWebsiteLink && (
                <p style={{ fontSize: '0.9em', margin: '0' }}>
                  Visit: <a href={article.authorWebsiteLink} target="_blank" rel="noopener noreferrer nofollow">{article.authorWebsiteLink}</a>
                </p>
              )}
            </div>
          </div>
        )}

        { (article.slug === "mastering-customer-engagement-partner" || article.slug === "future-of-web-dev-2024") &&
          <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px dashed #ccc', clear: 'both' }}>
            <p>
              Enjoying this article? You might also like this
              {' '}
              <a
                href="https://placeholder-affiliate-link.com/article-contextual-deal"
                target="_blank"
                rel="noopener noreferrer sponsored"
                style={{ color: '#007bff' }}
              >
                Specialized Course on {article.tags && article.tags.length > 0 ? article.tags[0] : "this Topic"}
              </a>.
              <span style={{ fontSize: '0.8em', color: '#777' }}> (Affiliate link)</span>
            </p>
          </div>
        }
      </>
    );
  }

  return (
    <div style={{ padding: '20px', lineHeight: '1.6' }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {article && <meta name="keywords" content={article.tags ? article.tags.join(', ') : ""} />}
        {article && article.isGuestPost && <meta name="author" content={article.authorName} />}
        {article && <meta property="article:published_time" content={article.publishDate} />}
        {/* Add other article-specific meta tags if needed */}
      </Helmet>

      {articleDisplayContent}

      <div style={{ marginTop: '30px', clear: 'both' }}>
        <Link to="/magazine">← Back to Magazine Home</Link>
      </div>
    </div>
  );
}

export default MagazineArticle;
