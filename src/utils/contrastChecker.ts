// Comprehensive UI contrast checker utility
export const ContrastChecker = {
  // Check all critical UI elements for proper contrast
  auditUIContrast: () => {
    console.log("🔍 Starting comprehensive UI contrast audit...");
    
    // Check all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const styles = window.getComputedStyle(button);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        console.warn(`⚠️ Button ${index}: Transparent background detected`, button);
      }
      
      if (textColor === 'rgb(255, 255, 255)' && (bgColor.includes('255, 255, 255') || bgColor === 'rgba(0, 0, 0, 0)')) {
        console.error(`❌ Button ${index}: White text on white/transparent background!`, button);
      }
    });
    
    // Check all badges
    const badges = document.querySelectorAll('[class*="badge"]');
    badges.forEach((badge, index) => {
      const styles = window.getComputedStyle(badge);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      if (textColor === 'rgb(255, 255, 255)' && bgColor.includes('255, 255, 255')) {
        console.error(`❌ Badge ${index}: White text on white background!`, badge);
      }
    });
    
    // Check all text elements for proper contrast
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const bgColor = styles.backgroundColor;
      
      if (textColor === 'rgb(255, 255, 255)' && (bgColor.includes('255, 255, 255') || bgColor === 'rgba(0, 0, 0, 0)')) {
        console.error(`❌ Text element ${index}: White text on white/transparent background!`, element);
      }
    });
    
    console.log("✅ UI contrast audit complete");
  },
  
  // Fix common contrast issues programmatically
  fixContrastIssues: () => {
    console.log("🔧 Applying automatic contrast fixes...");
    
    // Fix white text on white backgrounds
    const problematicElements = document.querySelectorAll('*');
    problematicElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const bgColor = styles.backgroundColor;
      
      if (textColor === 'rgb(255, 255, 255)' && 
          (bgColor.includes('255, 255, 255') || bgColor === 'rgba(0, 0, 0, 0)')) {
        // Apply emergency contrast fix
        (element as HTMLElement).style.color = 'var(--primary)';
        console.log("🔧 Fixed contrast issue on element:", element);
      }
    });
    
    console.log("✅ Automatic contrast fixes applied");
  }
};

// Auto-run contrast checks in development
if (process.env.NODE_ENV === 'development') {
  // Run checks when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => ContrastChecker.auditUIContrast(), 1000);
    });
  } else {
    setTimeout(() => ContrastChecker.auditUIContrast(), 1000);
  }
}