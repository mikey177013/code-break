// Global variables
let htmlContent = "", cssContent = "", jsContent = "";

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
    
    // Set up event listeners
    document.getElementById('splitCode').addEventListener('click', splitHTML);
    document.getElementById('loadSample').addEventListener('click', loadSample);
    document.getElementById('clearCode').addEventListener('click', clearAll);
    document.getElementById('downloadAll').addEventListener('click', downloadZIP);
    
    // Phoenix link click event
    document.getElementById('phoenixLink').addEventListener('click', function() {
        window.open('https://github.com/mikey177013', '_blank');
    });
    
    // Set up event delegation for copy and download buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-copy]')) {
            const targetId = e.target.closest('[data-copy]').getAttribute('data-copy');
            copyText(targetId);
        }
        
        if (e.target.closest('[data-download]')) {
            const target = e.target.closest('[data-download]');
            const targetId = target.getAttribute('data-download');
            const filename = target.getAttribute('data-filename');
            downloadText(targetId, filename);
        }
    });
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Load sample code and split it
    loadSample();
    splitHTML();
}

/**
 * Extracts HTML, CSS, and JS from the input textarea
 */
function splitHTML() {
    const fullHtml = document.getElementById('fullHtmlInput').value;
    
    if (!fullHtml.trim()) {
        showToast('Please enter some HTML code', 'warning');
        return;
    }

    // Extract CSS from <style> tags
    const cssMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    cssContent = cssMatch ? cssMatch.map(s => s.replace(/<style[^>]*>|<\/style>/gi, "").trim()).join("\n") : "";

    // Extract JavaScript from <script> tags
    const jsMatch = fullHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    jsContent = jsMatch ? jsMatch.map(s => s.replace(/<script[^>]*>|<\/script>/gi, "").trim()).join("\n") : "";

    // Extract pure HTML by removing style and script tags
    htmlContent = fullHtml
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .trim();

    // Update output textareas with animation
    animateTextareaUpdate('htmlOutput', htmlContent);
    animateTextareaUpdate('cssOutput', cssContent);
    animateTextareaUpdate('jsOutput', jsContent);

    // Update stats
    updateStats();
    
    // Show success message
    showToast('Code successfully split!', 'success');
}

/**
 * Animate textarea content update
 */
function animateTextareaUpdate(textareaId, content) {
    const textarea = document.getElementById(textareaId);
    textarea.style.opacity = '0.5';
    textarea.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        textarea.value = content;
        textarea.style.opacity = '1';
        textarea.style.transform = 'translateY(0)';
    }, 300);
}

/**
 * Updates the line count and total size statistics
 */
function updateStats() {
    const htmlLines = htmlContent ? htmlContent.split('\n').length : 0;
    const cssLines = cssContent ? cssContent.split('\n').length : 0;
    const jsLines = jsContent ? jsContent.split('\n').length : 0;
    
    const totalSize = (htmlContent.length + cssContent.length + jsContent.length) / 1024;
    
    // Animate stat updates
    animateCounter('htmlLines', htmlLines);
    animateCounter('cssLines', cssLines);
    animateCounter('jsLines', jsLines);
    
    // Update total size
    document.getElementById('totalSize').textContent = totalSize.toFixed(2) + ' KB';
    
    // Update file sizes in output cards
    updateFileSizes();
}

/**
 * Animate counter values
 */
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 500; // ms
    const steps = 20;
    const stepValue = (targetValue - currentValue) / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(currentValue + (stepValue * currentStep));
        element.textContent = newValue;
        
        if (currentStep >= steps) {
            element.textContent = targetValue;
            clearInterval(timer);
        }
    }, duration / steps);
}

/**
 * Update file sizes in output cards
 */
function updateFileSizes() {
    const htmlSize = (htmlContent.length / 1024).toFixed(2) + ' KB';
    const cssSize = (cssContent.length / 1024).toFixed(2) + ' KB';
    const jsSize = (jsContent.length / 1024).toFixed(2) + ' KB';
    
    // Find file size elements and update them
    document.querySelectorAll('.file-size').forEach(el => {
        const card = el.closest('.output-card');
        if (card.classList.contains('html-card')) {
            el.textContent = htmlSize;
        } else if (card.classList.contains('css-card')) {
            el.textContent = cssSize;
        } else if (card.classList.contains('js-card')) {
            el.textContent = jsSize;
        }
    });
}

/**
 * Copies the content of a textarea to the clipboard
 * @param {string} id - The ID of the textarea to copy from
 */
function copyText(id) {
    const textarea = document.getElementById(id);
    if (!textarea.value) {
        showToast('No content to copy!', 'warning');
        return;
    }
    
    // Create a temporary textarea for copying
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = textarea.value;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    // Visual feedback
    const copyButton = document.querySelector(`[data-copy="${id}"]`);
    const originalIcon = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i>';
    copyButton.style.background = 'var(--success)';
    
    setTimeout(() => {
        copyButton.innerHTML = originalIcon;
        copyButton.style.background = '';
    }, 1000);
    
    // Show toast notification
    const fileName = id === 'htmlOutput' ? 'HTML' : id === 'cssOutput' ? 'CSS' : 'JavaScript';
    showToast(`${fileName} code copied to clipboard!`, 'success');
}

/**
 * Downloads the content of a textarea as a file
 * @param {string} id - The ID of the textarea to download from
 * @param {string} filename - The name of the file to save
 */
function downloadText(id, filename) {
    const content = document.getElementById(id).value;
    
    if (!content.trim()) {
        showToast('No content to download', 'warning');
        return;
    }
    
    const blob = new Blob([content], {type: "text/plain"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    
    // Visual feedback
    const downloadButton = document.querySelector(`[data-download="${id}"]`);
    const originalIcon = downloadButton.innerHTML;
    downloadButton.innerHTML = '<i class="fas fa-check"></i>';
    downloadButton.style.background = 'var(--success)';
    
    setTimeout(() => {
        downloadButton.innerHTML = originalIcon;
        downloadButton.style.background = '';
    }, 1000);
    
    showToast(`${filename} downloaded successfully!`, 'success');
}

/**
 * Downloads all extracted files as a single ZIP archive
 */
async function downloadZIP() {
    if (!htmlContent && !cssContent && !jsContent) {
        showToast('No content to download', 'warning');
        return;
    }
    
    try {
        const zip = new JSZip();
        if (htmlContent) zip.file("index.html", htmlContent);
        if (cssContent) zip.file("style.css", cssContent);
        if (jsContent) zip.file("script.js", jsContent);
        
        const blob = await zip.generateAsync({type: "blob"});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "web-project.zip";
        a.click();
        
        // Visual feedback
        const downloadAllButton = document.getElementById('downloadAll');
        const originalContent = downloadAllButton.innerHTML;
        downloadAllButton.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        downloadAllButton.style.background = 'var(--success)';
        
        setTimeout(() => {
            downloadAllButton.innerHTML = originalContent;
            downloadAllButton.style.background = '';
        }, 2000);
        
        showToast('All files downloaded as ZIP!', 'success');
    } catch (error) {
        console.error('Error creating ZIP:', error);
        showToast('Error creating ZIP file', 'warning');
    }
}

/**
 * Clears all input and output fields
 */
function clearAll() {
    // Animate clearing of input textarea
    const input = document.getElementById('fullHtmlInput');
    input.style.opacity = '0.5';
    input.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        input.value = '';
        input.style.opacity = '1';
        input.style.transform = 'scale(1)';
    }, 300);
    
    // Animate clearing of output textareas
    animateTextareaUpdate('htmlOutput', '');
    animateTextareaUpdate('cssOutput', '');
    animateTextareaUpdate('jsOutput', '');
    
    // Reset content variables
    htmlContent = "";
    cssContent = "";
    jsContent = "";
    
    // Reset stats with animation
    updateStats();
    
    // Visual feedback for clear button
    const clearButton = document.getElementById('clearCode');
    const originalIcon = clearButton.innerHTML;
    clearButton.innerHTML = '<i class="fas fa-check"></i> Cleared!';
    clearButton.style.background = 'var(--success)';
    
    setTimeout(() => {
        clearButton.innerHTML = originalIcon;
        clearButton.style.background = '';
    }, 2000);
    
    showToast('All fields cleared successfully!', 'success');
}

/**
 * Loads a sample HTML template into the input field
 */
function loadSample() {
    const sampleHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Sample Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        p {
            line-height: 1.6;
            color: #555;
        }
        .btn {
            display: inline-block;
            background: #4361ee;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: #3a0ca3;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to CodeSplit Pro</h1>
        <p>This is a sample HTML page with embedded CSS and JavaScript. Use the splitter to separate them into individual files.</p>
        <button id="demoButton" class="btn">Click Me!</button>
        <div id="output" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;"></div>
    </div>
    <script>
        document.getElementById('demoButton').addEventListener('click', function() {
            const output = document.getElementById('output');
            output.innerHTML = '<p>Button clicked! This JavaScript is now separated from your HTML.</p>';
            
            // Add some dynamic styling
            output.style.background = '#e8f4fd';
            output.style.borderLeft = '4px solid #4361ee';
            output.style.padding = '15px';
        });
        
        // Additional sample JavaScript
        console.log('Sample page loaded successfully');
    </script>
</body>
</html>`;
    
    // Animate the input update
    const input = document.getElementById('fullHtmlInput');
    input.style.opacity = '0.5';
    input.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        input.value = sampleHTML;
        input.style.opacity = '1';
        input.style.transform = 'scale(1)';
        showToast('Sample code loaded', 'success');
    }, 300);
}

/**
 * Displays a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success' or 'warning')
 */
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast'; // Reset classes
    toast.classList.add(type, 'show');
    
    // Add animation
    toast.style.animation = 'none';
    setTimeout(() => {
        toast.style.animation = 'fadeInRight 0.3s ease-out';
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add fadeInRight animation for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);