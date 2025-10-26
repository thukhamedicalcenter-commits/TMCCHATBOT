import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

const styles = `
  :root {
    --primary-color: #2a7a7b; /* A calming teal */
    --secondary-color: #6c757d;
    --background-color: #e6f3f8; /* Light Blue */
    --surface-color: #ffffff;
    --user-bubble-color: #dcf8c6;
    --bot-bubble-color: #f1f0f0;
    --text-color: #2c3e50; /* Dark Slate Blue */
    --font-family: 'Roboto', 'Noto Sans Myanmar', sans-serif;
  }

  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Noto+Sans+Myanmar:wght@400;700&display=swap');

  body {
    font-family: var(--font-family);
    background-color: var(--background-color);
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #root {
    width: 100%;
    max-width: 800px;
    height: 100%;
    max-height: 90vh;
    background-color: var(--surface-color);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Patient Form Styles */
  .form-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    height: 100%;
    text-align: center;
    overflow-y: auto; /* Allow scrolling on small screens */
  }

  .form-container h2 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
  }
  
  .form-input-group {
    width: 100%;
    max-width: 400px;
    margin-bottom: 1rem;
    text-align: left; /* Align error messages */
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    font-family: var(--font-family);
    box-sizing: border-box; /* Ensures padding doesn't affect width */
  }

  .form-error {
    color: #d93025; /* A standard error red */
    font-size: 0.875rem;
    margin-top: 4px;
    margin-bottom: 0;
  }

  /* Symptom Checker Styles */
  .symptom-checker-group {
      width: 100%;
      max-width: 400px;
      margin-bottom: 1rem;
      text-align: left;
  }

  .symptom-checker-group label {
      display: block;
      margin-bottom: 0.75rem;
      color: var(--text-color);
      font-weight: bold;
  }

  .symptom-tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
  }

  .symptom-tag {
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color);
      border-radius: 20px;
      background-color: transparent;
      color: var(--primary-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-size: 0.9rem;
  }

  .symptom-tag:hover {
      background-color: rgba(42, 122, 123, 0.1);
  }

  .symptom-tag.selected {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
  }

  .other-symptom-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      font-family: var(--font-family);
      box-sizing: border-box;
      margin-top: 0.75rem;
  }

  .start-chat-btn, .view-history-btn {
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .start-chat-btn {
    border: none;
    background-color: var(--primary-color);
    color: white;
    margin-top: 1rem;
  }

  .start-chat-btn:hover {
    background-color: #1e5a5b;
  }
  
  .view-history-btn {
    border: 1px solid var(--primary-color);
    background-color: transparent;
    color: var(--primary-color);
    margin-top: 0.75rem;
  }

  .view-history-btn:hover {
    background-color: var(--primary-color);
    color: white;
  }

  .chat-header {
    background: linear-gradient(90deg, var(--primary-color), #3c9d9e);
    color: white;
    padding: 1rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    flex-shrink: 0;
  }

  .chat-window {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    padding: 0.75rem 1rem;
    border-radius: 18px;
    line-height: 1.5;
    word-wrap: break-word;
    color: var(--text-color);
  }
  
  .message.user {
    background-color: var(--user-bubble-color);
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  
  .message.bot {
    background-color: var(--bot-bubble-color);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }

  /* Remove background for special messages */
  .message.bot.no-bubble {
    background-color: transparent;
    padding: 0;
  }

  .message.loading {
    align-self: flex-start;
  }
  
  .message-image {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    margin-bottom: 8px;
    cursor: pointer; /* Indicate it's clickable */
    transition: opacity 0.2s;
  }

  .message-image:hover {
      opacity: 0.8;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 5px;
  }
  .typing-indicator p {
    margin: 0;
    margin-right: 5px;
    color: var(--secondary-color);
    font-style: italic;
    font-size: 0.9rem;
  }
  .typing-indicator span {
    height: 10px;
    width: 10px;
    margin: 0 3px;
    background-color: #9E9E9E;
    border-radius: 50%;
    display: inline-block;
    animation: wave 1.4s infinite ease-in-out both;
  }
  .typing-indicator span:nth-of-type(1) { animation-delay: 0.2s; }
  .typing-indicator span:nth-of-type(2) { animation-delay: 0.4s; }
  .typing-indicator span:nth-of-type(3) { animation-delay: 0.6s; }
  
  @keyframes wave {
    0%, 60%, 100% { transform: initial; }
    30% { transform: translateY(-10px); }
  }

  .chat-input-area {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
    background-color: var(--surface-color);
    flex-shrink: 0;
  }

  .attachment-preview {
    position: relative;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .attachment-preview img {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
  }

  .remove-attachment-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: rgba(0,0,0,0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 20px;
  }
  
  .chat-input {
    display: flex;
    align-items: center;
  }
  
  .chat-input input[type="text"] {
    flex-grow: 1;
    border: 1px solid var(--secondary-color);
    border-radius: 20px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    margin-right: 0.5rem;
    background-color: var(--secondary-color);
    color: white;
  }

  .chat-input input[type="text"]::placeholder {
    color: #d3d3d3; /* LightGray, for visibility on dark background */
  }

  .chat-input input[type="text"]:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 122, 123, 0.25);
  }
  
  .chat-input button, .attachment-btn {
    border: none;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }
  
  .attachment-btn {
    background-color: var(--secondary-color);
    margin-right: 0.5rem;
  }

  .attachment-btn:hover {
    background-color: #5a6268;
  }

  .chat-input button:hover {
    background-color: #1e5a5b;
  }

  .chat-input button:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }

  .md-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    font-size: 0.9em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  }

  .md-table th, .md-table td {
    padding: 12px 15px;
    text-align: left;
    color: var(--text-color); /* Ensures text is readable */
    border-bottom: 1px solid #e0e0e0;
  }

  .md-table th {
    background-color: var(--primary-color);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .md-table tbody tr {
    background-color: #fff;
  }

  .md-table tbody tr:nth-of-type(even) {
    background-color: #f9f9f9; /* Subtle zebra striping */
  }
  
  .md-table tbody tr:last-child td {
    border-bottom: none;
  }

  .confirmation-message {
    background-color: #e8f5e9; /* Light green */
    border-left: 5px solid #4caf50; /* Solid green border on the left */
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    color: #2e7d32; /* Darker green text */
    max-width: 80%;
    align-self: flex-start;
  }

  .confirmation-message h4 {
    margin-top: 0;
    color: #1b5e20; /* Even darker green for the title */
    font-size: 1.1em;
  }

  .confirmation-message p {
    margin-bottom: 0;
  }

  /* Image Viewer Modal Styles */
  .image-viewer-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    cursor: pointer;
  }

  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 1002;
    text-shadow: 0 0 5px black;
  }

  .modal-content {
    position: relative;
    z-index: 1001;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90%;
    height: 90%;
  }

  .modal-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    transition: transform 0.1s ease-out;
    cursor: zoom-in;
    user-select: none; /* Prevents selecting image text while dragging */
  }
  
  /* History Viewer Styles */
  .history-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
  }

  .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 2px solid var(--primary-color);
      flex-shrink: 0;
      background-color: var(--surface-color);
      gap: 1rem; /* Add spacing between items */
  }

  .history-header h2 {
      color: var(--primary-color);
      margin: 0;
      font-size: 1.25rem;
      flex-shrink: 0; /* Prevent title from shrinking */
  }
  
  .history-search-input {
      flex-grow: 1; /* Allow it to take up available space */
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 20px;
      font-family: var(--font-family);
  }

  .history-search-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 122, 123, 0.25);
  }

  .history-back-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color);
      background-color: var(--primary-color);
      color: white;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
  }

  .history-back-btn:hover {
      background-color: #1e5a5b;
      border-color: #1e5a5b;
  }

  .history-content {
      flex-grow: 1;
      overflow-y: auto;
      padding: 1rem;
      background-color: var(--background-color);
  }

  .no-history-message {
      text-align: center;
      color: var(--secondary-color);
      margin-top: 2rem;
      font-size: 1.1rem;
  }

  .history-record-card {
      background-color: var(--surface-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      border-left: 5px solid var(--primary-color);
  }

  .history-record-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--primary-color);
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
  }

  .history-record-card p, .history-record-card div {
      margin-bottom: 0.75rem;
  }

  .history-record-card p:last-child, .history-record-card div:last-child {
      margin-bottom: 0;
  }

  .history-record-card strong {
      color: var(--text-color);
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const PREDEFINED_SYMPTOMS = [
    { en: 'Fever', my: 'ဖျားခြင်း' },
    { en: 'Cough', my: 'ချောင်းဆိုးခြင်း' },
    { en: 'Headache', my: 'ခေါင်းကိုက်ခြင်း' },
    { en: 'Sore Throat', my: 'လည်ချောင်းနာခြင်း' },
    { en: 'Runny Nose', my: 'နှာစေးခြင်း' },
    { en: 'Body Aches', my: 'ကိုယ်လက်ကိုက်ခဲခြင်း' },
    { en: 'Fatigue', my: 'ပင်ပန်းနွမ်းနယ်ခြင်း' },
    { en: 'Diarrhea', my: 'ဝမ်းလျှောခြင်း' },
    { en: 'Nausea', my: 'ပျို့အန်ခြင်း' },
];

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const setMedicationReminder: FunctionDeclaration = {
    name: 'setMedicationReminder',
    description: 'Sets a browser notification to remind the user to take their medication at a specific time.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            medicationName: {
                type: Type.STRING,
                description: 'The name of the medication. E.g., "Paracetamol", "Amoxicillin".'
            },
            dosage: {
                type: Type.STRING,
                description: 'The dosage of the medication. E.g., "1 tablet", "500mg", "10ml".'
            },
            time: {
                type: Type.STRING,
                description: 'The time for the reminder in 24-hour HH:MM format. E.g., "08:00", "21:30".'
            }
        },
        required: ['medicationName', 'dosage', 'time']
    }
};


const ImageViewerModal = ({ src, onClose }: { src: string, onClose: () => void }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const lastTouchDistance = useRef(0);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Reset position if scale goes back to 1 and update cursor
    useEffect(() => {
        if (scale === 1) {
            setPosition({ x: 0, y: 0 });
        }
        if (imageRef.current) {
            imageRef.current.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        }
    }, [scale]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newScale = scale - e.deltaY * 0.001;
        setScale(Math.min(Math.max(1, newScale), 5)); // Clamp scale between 1x and 5x
    };

    const startDrag = (clientX: number, clientY: number) => {
        if (scale > 1) {
            isDragging.current = true;
            startPos.current = {
                x: clientX - position.x,
                y: clientY - position.y,
            };
            if (imageRef.current) imageRef.current.style.cursor = 'grabbing';
        }
    };

    const doDrag = (clientX: number, clientY: number) => {
        if (isDragging.current) {
            const newX = clientX - startPos.current.x;
            const newY = clientY - startPos.current.y;
            setPosition({ x: newX, y: newY });
        }
    };

    const endDrag = () => {
        isDragging.current = false;
        if (imageRef.current) {
            imageRef.current.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        e.preventDefault();
        doDrag(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            isDragging.current = false; // Stop dragging for pinch-zoom
            lastTouchDistance.current = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging.current) {
            doDrag(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            const touchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = touchDistance - lastTouchDistance.current;
            const newScale = scale + delta * 0.01;
            setScale(Math.min(Math.max(1, newScale), 5));
            lastTouchDistance.current = touchDistance;
        }
    };

    return (
        <div className="image-viewer-modal" onMouseMove={handleMouseMove} onMouseUp={endDrag} onMouseLeave={endDrag}>
            <div className="modal-overlay" onClick={onClose}></div>
            <button className="modal-close-btn" onClick={onClose}>×</button>
            <div className="modal-content">
                <img
                    ref={imageRef}
                    src={src}
                    alt="Medical Record Preview"
                    className="modal-image"
                    style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={endDrag}
                />
            </div>
        </div>
    );
};

const BotMessageContent = ({ content }: { content: string }) => {
  // Check for the confirmation message first
  const confirmationRegex = /✅\s*\*\*(.*?)\*\*\s*✅\s*\n([\s\S]*)/;
  const confirmationMatch = content.match(confirmationRegex);

  if (confirmationMatch) {
    const title = confirmationMatch[1];
    const body = confirmationMatch[2];
    return (
      <div className="confirmation-message">
        <h4>✅ {title}</h4>
        <p>{body.trim().split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
      </div>
    );
  }

  // Helper function to parse inline markdown (bold, italic)
  const renderInline = (text: string): React.ReactNode => {
    // Split text by markdown delimiters, keeping the delimiters for processing
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g);
    return (
      <>
        {parts.filter(Boolean).map((part, i) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
            return <em key={i}>{part.slice(1, -1)}</em>;
          }
          return part; // Return plain text part
        })}
      </>
    );
  };

  // Helper function to render a block of text that is not a table
  const renderTextPart = (text: string, partIndex: number) => {
    // Split the text into blocks based on one or more blank lines
    const blocks = text.trim().split(/\n\s*\n/);

    return (
      <div key={partIndex}>
        {blocks.map((block, blockIndex) => {
          const lines = block.trim().split('\n');

          // Check if the block is an unordered list
          const isUl = lines.length > 0 && lines.every(line => /^\s*[-*+]\s/.test(line));
          if (isUl) {
            return (
              <ul key={blockIndex} style={{ paddingLeft: '20px', margin: '0.5em 0' }}>
                {lines.map((line, i) => (
                  <li key={i}>{renderInline(line.replace(/^\s*[-*+]\s/, ''))}</li>
                ))}
              </ul>
            );
          }

          // Check if the block is an ordered list
          const isOl = lines.length > 0 && lines.every(line => /^\s*\d+\.\s/.test(line));
          if (isOl) {
            return (
              <ol key={blockIndex} style={{ paddingLeft: '20px', margin: '0.5em 0' }}>
                {lines.map((line, i) => (
                  <li key={i}>{renderInline(line.replace(/^\s*\d+\.\s/, ''))}</li>
                ))}
              </ol>
            );
          }

          // Otherwise, treat it as a paragraph
          return (
            <p key={blockIndex} style={{ margin: '0.5em 0' }}>
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {renderInline(line)}
                  {i < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  // Main logic to separate tables from other text content
  const lines = content.split('\n');
  const contentParts: (string | string[][])[] = [];
  let currentText = '';
  let inTable = false;
  let currentTable: string[][] = [];

  lines.forEach(line => {
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        if (currentText.trim()) contentParts.push(currentText);
        currentText = '';
        inTable = true;
        currentTable = [];
      }
      const cells = line.trim().split('|').slice(1, -1).map(cell => cell.trim());
      // Filter out the separator line of a markdown table
      if (!cells.every(cell => cell.replace(/-/g, '').trim() === '')) {
        currentTable.push(cells);
      }
    } else {
      if (inTable) {
        contentParts.push(currentTable);
        inTable = false;
      }
      currentText += line + '\n';
    }
  });

  if (inTable) {
    contentParts.push(currentTable);
  } else if (currentText.trim()) {
    contentParts.push(currentText);
  }

  return (
    <div>
      {contentParts.map((part, index) => {
        if (typeof part === 'string') {
          // Use the new text renderer for string parts
          return renderTextPart(part, index);
        } else {
          // Render tables as before
          const table = part;
          if (table.length === 0) return null;
          const headers = table[0];
          const rows = table.slice(1);
          return (
            <table key={index} className="md-table">
              <thead>
                <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j}>{renderInline(cell)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          );
        }
      })}
    </div>
  );
};

const HistoryViewer = ({ onClose }: { onClose: () => void }) => {
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);

    // Load initial history from localStorage
    useEffect(() => {
        try {
            const historyJSON = localStorage.getItem('thukhaConsultationHistory');
            const storedHistory = historyJSON ? JSON.parse(historyJSON) : [];
            if (Array.isArray(storedHistory)) {
                storedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setAllHistory(storedHistory);
            }
        } catch (error) {
            console.error("Failed to load history from localStorage:", error);
            setAllHistory([]);
        }
    }, []);
    
    // Effect to filter history based on search query or when source data changes
    useEffect(() => {
        if (!searchQuery) {
            setFilteredHistory(allHistory); // If search is empty, show all records
            return;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        const results = allHistory.filter(record => {
            const dateString = new Date(record.timestamp).toLocaleString().toLowerCase();
            const name = (record.name ?? '').toLowerCase();
            const symptoms = (record.symptoms ?? '').toLowerCase();
            const diagnosis = (record.diagnosis ?? '').toLowerCase();
            const prescription = (record.prescription ?? '').toLowerCase();
            const advice = (record.advice_mm ?? '').toLowerCase();

            // Check if any field contains the search query
            return (
                dateString.includes(lowercasedQuery) ||
                name.includes(lowercasedQuery) ||
                symptoms.includes(lowercasedQuery) ||
                diagnosis.includes(lowercasedQuery) ||
                prescription.includes(lowercasedQuery) ||
                advice.includes(lowercasedQuery)
            );
        });
        setFilteredHistory(results);
    }, [searchQuery, allHistory]);

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>မှတ်တမ်းများ (History)</h2>
                <input
                    type="text"
                    placeholder="ရက်စွဲ (သို့) စာလုံးဖြင့်ရှာရန်"
                    className="history-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search past consultations"
                />
                <button onClick={onClose} className="history-back-btn">← နောက်သို့</button>
            </div>
            <div className="history-content">
                {allHistory.length === 0 ? (
                    <p className="no-history-message">မှတ်တမ်းများမရှိပါ။ (No past records found.)</p>
                ) : filteredHistory.length === 0 ? (
                     <p className="no-history-message">"{searchQuery}" အတွက် ရှာမတွေ့ပါ။ (No records found.)</p>
                ) : (
                    filteredHistory.map((record, index) => (
                        <div key={index} className="history-record-card">
                            <h3>{new Date(record.timestamp).toLocaleString()}</h3>
                            <p><strong>လူနာအမည် (Name):</strong> {record.name}</p>
                            <p><strong>ရောဂါလက္ခဏာများ (Symptoms):</strong> {record.symptoms}</p>
                            <p><strong>ရောဂါသုံးသပ်ချက် (Diagnosis):</strong> {record.diagnosis}</p>
                            <div>
                                <strong>ညွှန်ကြားခဲ့သောဆေးများ (Prescription):</strong>
                                <BotMessageContent content={record.prescription} />
                            </div>
                            <div>
                                <strong>လူနာအကြံပြုချက် (Advice):</strong>
                                <p>{record.advice_mm.replace("🗣 လူနာအကြံပြုချက် –", "").trim()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


const App = () => {
    // IMPORTANT: Replace this with your actual Google Apps Script Web App URL
    const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwmx7ezmHJDFpH_88rr4UQ0IG1SwON9UyhH9BnNkM8e/devE';
    
    // --- Sound Effects ---
    const SOUND_SENT = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaXRyYXRlVGFnIFVERCAyLjEuMSBieSBXb2xmLURvZwAAAAAAdiEuMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA...';
    const SOUND_RECEIVED = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaXRyYXRlVGFnIFVERCAyLjEuMSBieSBXb2xmLURvZwAAAAAAdiEuMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA...';
    const SOUND_TYPING = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaXRyYXRlVGFnIFVERCAyLjEuMSBieSBXb2xmLURvZwAAAAAAdiEuMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA...';

    const [isChatStarted, setIsChatStarted] = useState(false);
    const [patientDetails, setPatientDetails] = useState({ name: '', patientId: '', age: '', sex: '', symptoms: '' });
    const [formErrors, setFormErrors] = useState({ name: '', age: '', sex: '' });
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [otherSymptom, setOtherSymptom] = useState('');
    const [showOtherSymptomInput, setShowOtherSymptomInput] = useState(false);
    const [messages, setMessages] = useState<{ id: number; sender: 'user' | 'bot'; content: string; imageUrl?: string; className?: string; }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);
    const [typingMessage, setTypingMessage] = useState('စာရိုက်နေပါသည်...');
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingIndicatorTimer = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const LOCAL_STORAGE_KEY = 'thukhaChatHistory';

    // --- Refs for audio elements ---
    const sentSound = useRef<HTMLAudioElement | null>(null);
    const receivedSound = useRef<HTMLAudioElement | null>(null);
    const typingSound = useRef<HTMLAudioElement | null>(null);
    const prevShowTypingIndicator = useRef(false);

    // Effect to initialize audio objects once
    useEffect(() => {
        sentSound.current = new Audio(SOUND_SENT);
        receivedSound.current = new Audio(SOUND_RECEIVED);
        typingSound.current = new Audio(SOUND_TYPING);
        
        // Adjust volume to be subtle
        if (sentSound.current) sentSound.current.volume = 0.5;
        if (receivedSound.current) receivedSound.current.volume = 0.5;
        if (typingSound.current) typingSound.current.volume = 0.3;
    }, []);

    const getSystemInstruction = (details: { name: string, age: string, sex: string, patientId: string, symptoms: string }) => {
        const patientIdInstruction = details.patientId
            ? `- Patient ID: ${details.patientId}\n   - This is a returning patient. Acknowledge their ID and inform them you are retrieving their past records (e.g., "ဟုတ်ကဲ့၊ လူနာမှတ်ပုံတင်အမှတ် ${details.patientId} အတွက် ယခင်မှတ်တမ်းကို ရှာဖွေနေပါသည်။").\n   - You will *simulate* having this data. Assume their last visit was for a related, mild condition and incorporate this into your analysis.\n   - You MUST populate the \`patient_id\` field in the final JSON log with "${details.patientId}".`
            : `- Patient ID: None provided.\n   - This is a new patient. Explain the Re-registration fee (5000 MMK via KBZPay/WavePay).\n   - The \`patient_id\` in the final JSON log should be \`null\`.`;

        const symptomsInstruction = details.symptoms
            ? `- Provided Symptoms: ${details.symptoms}\n   - The patient has already provided these initial symptoms. Acknowledge them directly (e.g., "ဟုတ်ကဲ့၊ ${details.symptoms} တို့ကို ခံစားနေရသည်ကို လက်ခံရရှိပါတယ်").\n   - **Crucially, you must now ask detailed follow-up questions for EACH symptom provided to understand its specific characteristics.** Do NOT ask "What are your symptoms?" again.`
            : `   - Ask for their current health problems in Burmese. Give examples (e.g. နှာစေး၊ ချောင်းဆိုး၊ ဖျား၊ ဗိုက်နာ၊ ဝမ်းပျက်၊ ကိုယ်လက်အဆစ်နာ).`;
        
        return `
ROLE:
You are the “Thukha GP Virtual Assistant,” a professional medical chat bot for Thukha Medical Center in Myanmar.
You assist patients bycollecting health information, providing safe preliminary advice, and coordinating teleconsultation with a doctor.

---

🎯 OBJECTIVES:
1. Communicate in a calm, caring, and professional tone.
2. Use **Myanmar language (Burmese)** for all patient messages and instructions.
3. When summarizing or generating medical data, use bilingual format (English + Myanmar).
4. Never prescribe controlled or Rx-only medicines — give only safe OTC-level recommendations.
5. If serious or red-flag symptoms appear, escalate: advise the patient to book doctor consultation.

---

**SYMPTOM ELABORATION GUIDE:**
When a patient reports a symptom, you MUST ask clarifying questions to gather more details. This is a critical step. Use the following examples as a guide:
- **If 'Fever' (ဖျားခြင်း):** Ask "ဘယ်လောက်ကြာပြီလဲ။ ကိုယ်ပူချိန်တိုင်းမိလား။ ချမ်းတုန်တာမျိုးရော ရှိပါသလား။" (How long has it been? Did you measure your temperature? Do you have chills?)
- **If 'Cough' (ချောင်းဆိုးခြင်း):** Ask "ချောင်းခြောက်ဆိုးတာလား၊ ဒါမှမဟုတ် သလိပ်ပါတာလား။ ရင်ဘတ်အောင့်တာမျိုးရော ရှိပါသလား။" (Is it a dry cough or a productive one with phlegm? Is there any chest discomfort?)
- **If 'Headache' (ခေါင်းကိုက်ခြင်း):** Ask "ခေါင်းရဲ့ ဘယ်ဘက်ခြမ်းက ကိုက်တာလဲ။ ခေါင်းထိုးကိုက်တာလား၊ ဒါမှမဟုတ် တဆစ်ဆစ်ကိုက်တာလား။ ပျို့အန်ချင်တာ (သို့) အလင်းမကြည့်နိုင်တာမျိုးရော ရှိပါသလား။" (Which part of the head hurts? Is it a sharp pain or a throbbing one? Is it accompanied by nausea or light sensitivity?)
- **If 'Diarrhea' (ဝမ်းလျှောခြင်း):** Ask "တစ်နေ့ကို ဘယ်နှစ်ကြိမ်လောက် ဝမ်းသွားပါသလဲ။ ဝမ်းထဲမှာ သွေး (သို့) အချွဲတွေ ပါပါသလား။" (How many times a day are you having bowel movements? Is there any blood or mucus in the stool?)
- **For any pain-related symptom (e.g., Body Aches, Sore Throat):** Ask about the severity on a scale of 1 to 10, where 10 is the worst pain imaginable. "နာကျင်မှုကို ၁ ကနေ ၁၀ အထိ အဆင့်သတ်မှတ်ပေးပါ (၁၀ က အပြင်းဆုံးဖြစ်ပါတယ်)။"

After acknowledging the initial symptoms, transition smoothly into these detailed questions. For example: "ဟုတ်ကဲ့၊ ဖျားပြီး ချောင်းဆိုးနေတာကို လက်ခံရရှိပါတယ်။ အဲ့ဒါနဲ့ပတ်သက်ပြီး မေးခွန်းလေးအချို့ မေးပါရစေ..." (Okay, I see you have a fever and cough. Let me ask a few more questions about that...).

---

⏰ **REMINDER FUNCTIONALITY:**
- You have a tool called \`setMedicationReminder\` that can schedule a browser notification for the user.
- If a user asks to be reminded to take their medicine, use this tool.
- You must extract the \`medicationName\`, \`dosage\`, and \`time\` from the user's request.
- The \`time\` MUST be converted to 24-hour HH:MM format before calling the function. For example, "8 PM" becomes "20:00".
- After setting the reminder, confirm it with the user in Burmese.

---

🩺 WORKFLOW:
You must strictly follow this workflow step-by-step. Do not skip steps.
1. **Patient Identification & Record Retrieval**:
   - The patient's details have been provided from the registration form. Here they are:
     - Name: ${details.name}
     - Age: ${details.age}
     - Sex: ${details.sex}
     ${patientIdInstruction}
   - You MUST use this information.
   - Start the conversation by greeting the patient warmly by their name in Burmese (e.g., "မင်္ဂလာပါ ${details.name} ခင်ဗျာ။").
   - Immediately follow up based on the Patient ID information above (either acknowledge the ID or explain the new patient fee).
   - **Do NOT ask the patient for their ID, as it has already been provided (or not) via the form.**
   - Once you have greeted them and handled the ID status, proceed to the next step.

2. **Symptom Screening & Elaboration**:
   ${symptomsInstruction}
   - **Follow the SYMPTOM ELABORATION GUIDE above to ask detailed follow-up questions.**
   - If symptoms sound mild (like a common cold), continue to the next step after gathering details.
   - If symptoms sound severe (e.g., "can't breathe", "chest pain", "high fever for days"), immediately advise them to book a doctor consultation and stop the automated screening.

3. **Vitals & Supporting Data**:
   - Ask the patient to provide their vital signs. Specifically ask for:
     - Blood Pressure (BP): "သွေးဖိအား" - mention to measure it three times, 5 mins apart, and provide the average result.
     - Pulse Rate (PR): "သွေးခုန်နှုန်း"
     - Oxygen Saturation (SpO₂): "အောက်ဆီဂျင်"
     - Temperature: "ကိုယ်အပူချိန်"
     - If they mention being diabetic, also ask for Random Blood Sugar (RBS): "သွေးချို".
   - After they provide vitals, ask if they are taking any current medications or have any allergies.
   - **Image-based Records (Optional)**: The patient may upload an image of past medical records or lab results. If an image is provided, analyze it to extract relevant information (like patient details, past diagnoses, lab values) and incorporate this data into your analysis.

4. **Data Analysis & Summary**:
   - Once you have all the information (symptoms, vitals, meds/allergies, image data), internally combine it.
   - Generate a brief clinical impression (e.g. mild flu, gastritis, joint pain, etc.). This is for your internal reasoning.

5. **Prescription & Advice**:
   - Based on the mild diagnosis, generate a **temporary OTC or supportive treatment plan**.
   - YOU MUST present this in a markdown table with this exact format:
     | Trade Name | Dose | Frequency | Duration | Purpose |
     |---|---|---|---|---|
   - Below the table, provide a short **Patient Advice section in Myanmar**. Start it with "🗣 လူနာအကြံပြုချက် –".
   - The advice should be simple (e.g., take medicine on time, drink water, rest, return if condition worsens).

6. **Consultation Escalation / Closing**:
   - Ask the patient if they would like to speak with a doctor via teleconsultation.
   - If they say yes, explain the 5000 MMK KBZPay/WavePay fee and ask them to confirm once they have paid.
   - **If the user confirms they have paid** (e.g., "ငွေလွှဲပြီးပါပြီ", "I have paid"), you MUST respond with a booking confirmation message.
   - The confirmation message must be formatted exactly like this, starting with the checkmark emoji and bold text:
     ✅ **Teleconsultation Confirmed** ✅
     Your appointment is booked. A doctor will contact you shortly. Thank you.
   - You must then end the conversation. Update the JSON log \`payment_status\` to "Paid".
   - If they say no, or don't want a consultation, end the conversation politely. Update the JSON log \`payment_status\` to "Not Applicable".

7. **Logging (IMPORTANT!)**:
   - At the very end of your response, after all patient-facing text, you MUST output a structured JSON object for the system log. It must be enclosed in a markdown code block like this:
     \`\`\`json
     {
       "patient_id": "string or null",
       "name": "${details.name}",
       "age": "${details.age}",
       "sex": "${details.sex}",
       "symptoms": "string",
       "vitals": "string",
       "diagnosis": "string (your clinical impression)",
       "prescription": "the full markdown table as a string",
       "advice_mm": "string",
       "payment_status": "Not Applicable / Pending / Paid"
     }
     \`\`\`
   - Fill this JSON with the data you collected during the conversation.

---

💬 **LANGUAGE & STYLE:**
- All patient-facing messages MUST be in Myanmar (Burmese).
- Use a polite, empathetic, and clear tone.
- Use emojis where appropriate to seem friendly (💊 🩺 🗣 ❤️).

---

🔐 SAFETY RULES:
- Do **not** provide or name restricted prescription drugs (e.g., antibiotics, strong painkillers). Only use common OTC drugs like Paracetamol, Antacids, ORS, etc.
- Do **not** give a definitive diagnosis for anything beyond very mild, common cases.
- Always encourage in-person/doctor consultation for severe or persistent cases.
`;
    }

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);
    
    // Initialize chat when the chat starts
    useEffect(() => {
        if (!isChatStarted) return;
        
        const initChat = async () => {
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const instruction = getSystemInstruction(patientDetails);
                const chat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: instruction,
                        tools: [{ functionDeclarations: [setMedicationReminder] }]
                    },
                });
                chatRef.current = chat;

                const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedHistory) {
                    setMessages(JSON.parse(savedHistory));
                } else {
                    const response = await chat.sendMessage({ message: "Start conversation" });
                    const botMessage = response.text;
                    const jsonLogRegex = /```json\s*([\s\S]*?)\s*```/;
                    const patientFacingMessage = botMessage.replace(jsonLogRegex, '').trim();
                    setMessages([{ id: Date.now(), sender: 'bot', content: patientFacingMessage }]);
                    receivedSound.current?.play().catch(e => console.error("Error playing received sound:", e));
                }
            } catch (error) {
                console.error("Chat initialization failed:", { 
                    details: "Could not connect to the Gemini API or create a chat session.",
                    error
                });
                setMessages([{ 
                    id: Date.now(), 
                    sender: 'bot', 
                    content: "စကားပြောခန်းကို စတင်နိုင်ခြင်းမရှိပါ။ ကျေးဇူးပြု၍ ခဏစောင့်ပြီး စာမျက်နှာကို ပြန်ဖွင့်စမ်းကြည့်ပါ။ (Could not start the chat. Please wait and refresh the page.)" 
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();
    }, [isChatStarted, patientDetails]);


    // Effect for smooth scrolling to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showTypingIndicator]);

    // Effect to manage the delayed typing indicator
    useEffect(() => {
        if (isLoading) {
            typingIndicatorTimer.current = window.setTimeout(() => {
                setShowTypingIndicator(true);
            }, 500); // 500ms delay
        } else {
            if (typingIndicatorTimer.current) {
                clearTimeout(typingIndicatorTimer.current);
            }
            setShowTypingIndicator(false);
        }

        return () => {
            if (typingIndicatorTimer.current) {
                clearTimeout(typingIndicatorTimer.current);
            }
        };
    }, [isLoading]);

    // Effect to play typing sound only when the indicator appears
    useEffect(() => {
        if (showTypingIndicator && !prevShowTypingIndicator.current) {
            typingSound.current?.play().catch(e => console.error("Error playing typing sound:", e));
        }
        prevShowTypingIndicator.current = showTypingIndicator;
    }, [showTypingIndicator]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachment(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachmentPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPatientDetails(prev => ({ ...prev, [name]: value }));
        // Clear the specific error when user starts correcting it
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleOtherSymptomToggle = () => {
        setShowOtherSymptomInput(prev => {
            const turningOff = prev;
            if (turningOff) {
                setOtherSymptom(''); // Clear text when hiding
            }
            return !prev;
        });
    };

    const validateForm = () => {
        const errors = { name: '', age: '', sex: '' };
        let isValid = true;
        if (!patientDetails.name.trim()) {
            errors.name = 'အမည်ဖြည့်ရန်လိုအပ်ပါသည်။';
            isValid = false;
        }
        if (!patientDetails.age) {
            errors.age = 'အသက်ဖြည့်ရန်လိုအပ်ပါသည်။';
            isValid = false;
        } else if (isNaN(Number(patientDetails.age)) || Number(patientDetails.age) <= 0) {
            errors.age = 'အသက်သည် ၀ ထက်ကြီးသော ကိန်းဂဏန်းဖြစ်ရပါမည်။';
            isValid = false;
        }
        if (!patientDetails.sex) {
            errors.sex = 'ကျား/မ ရွေးချယ်ရန်လိုအပ်ပါသည်။';
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };

    const handleStartChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const allSymptoms = [
                ...selectedSymptoms,
                otherSymptom.trim()
            ].filter(Boolean).join(', ');

            // Temporarily store all details in a new object before setting state
            const finalPatientDetails = { ...patientDetails, symptoms: allSymptoms };
            setPatientDetails(finalPatientDetails);

            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setMessages([]);
            setIsChatStarted(true);
        }
    };
    
    const handleSetReminder = async (args: { medicationName: string, dosage: string, time: string }) => {
        if (!('Notification' in window)) {
            return { result: "This browser does not support desktop notifications." };
        }
    
        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
    
        if (permission === 'denied') {
            return { result: "Notification permission has been denied. Please enable it in your browser settings to use reminders." };
        }
    
        if (permission === 'granted') {
            try {
                const { medicationName, dosage, time } = args;
                if (!/^\d{2}:\d{2}$/.test(time)) {
                    throw new Error("Invalid time format. Expected HH:MM.");
                }
    
                const [hours, minutes] = time.split(':').map(Number);
    
                const now = new Date();
                const reminderTime = new Date();
                reminderTime.setHours(hours, minutes, 0, 0);
    
                if (reminderTime <= now) {
                    reminderTime.setDate(reminderTime.getDate() + 1);
                }
    
                const delay = reminderTime.getTime() - now.getTime();
    
                setTimeout(() => {
                    new Notification('💊 Medication Reminder', {
                        body: `Time to take your ${medicationName} (${dosage}).`,
                    });
                }, delay);
    
                const formattedTime = reminderTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                return { result: `Reminder successfully set for ${medicationName} at ${formattedTime}.` };
            } catch (error) {
                console.error("Failed to set reminder:", error);
                return { result: `Error setting reminder: ${error instanceof Error ? error.message : String(error)}` };
            }
        }
        
        return { result: "Could not set reminder due to notification permissions." };
    };

    const saveRecordToGoogleSheet = async (record: object) => {
        // Ensure the Web App URL is configured before attempting to send data.
        if (!GOOGLE_SHEET_WEB_APP_URL) {
            console.warn('Google Sheet Web App URL is not configured. Skipping record save.');
            return;
        }
    
        try {
            // Using 'no-cors' mode is necessary for sending data to a standard Google Apps Script
            // Web App from a browser, as it bypasses CORS preflight checks.
            // NOTE: This is a "fire-and-forget" request. The browser sends the data but cannot
            // read the server's response. This means we cannot confirm if the data was
            // successfully written to the sheet, only that the request was sent without a network error.
            await fetch(GOOGLE_SHEET_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(record),
            });
            // This log confirms the request was dispatched, not that the data was successfully saved.
            console.log('Dispatched record to Google Sheet.');
        } catch (error) {
            // This catch block will only trigger on network failures (e.g., no internet),
            // not on server-side errors from the Apps Script itself.
            console.error('Error sending record to Google Sheet:', {
                details: "The request to the Google Apps Script endpoint failed. This is likely a network issue or a problem with the script itself.",
                error
            });
        }
    };
    
    const saveRecordLocally = (record: object) => {
        try {
            const historyJSON = localStorage.getItem('thukhaConsultationHistory');
            const history = historyJSON ? JSON.parse(historyJSON) : [];
            if (Array.isArray(history)) {
                history.push(record);
                localStorage.setItem('thukhaConsultationHistory', JSON.stringify(history));
            } else {
                localStorage.setItem('thukhaConsultationHistory', JSON.stringify([record]));
            }
        } catch (error) {
            console.error("Failed to save record to localStorage:", error);
        }
    };

    const handleSendMessage = async () => {
        if ((!inputValue.trim() && !attachment) || isLoading || !chatRef.current) return;

        if (inputValue.trim().toLowerCase() === 'show my history') {
            setIsChatStarted(false);
            setShowHistory(true);
            setInputValue('');
            return;
        }
        
        if (attachment) {
            setTypingMessage("ပုံကို စစ်ဆေးနေပါသည်...");
        } else {
            setTypingMessage("စာရိုက်နေပါသည်...");
        }
    
        const userMessage = {
            id: Date.now(),
            sender: 'user' as const,
            content: inputValue,
            imageUrl: attachmentPreview || undefined
        };
        
        sentSound.current?.play().catch(e => console.error("Error playing sent sound:", e));
        setMessages(prev => [...prev, userMessage]);
    
        const messageToSend = inputValue;
        setInputValue('');
        removeAttachment(); // Clear attachment after sending
        setIsLoading(true);
    
        try {
            let response;
            if (attachment) {
                const imagePart = await fileToGenerativePart(attachment);
                response = await chatRef.current.sendMessage({
                    message: [{ text: messageToSend }, imagePart],
                });
            } else {
                response = await chatRef.current.sendMessage({ message: messageToSend });
            }
    
            let finalBotMessage = '';
            // Handle function calls if they exist
            if (response.functionCalls && response.functionCalls.length > 0) {
                const functionCall = response.functionCalls[0];
                if (functionCall.name === 'setMedicationReminder') {
                    const result = await handleSetReminder(functionCall.args as { medicationName: string, dosage: string, time: string });
                    const toolResponse = await chatRef.current.sendMessage({
                        message: [{
                            functionResponse: {
                                name: functionCall.name,
                                response: result,
                            }
                        }]
                    });
                    finalBotMessage = toolResponse.text;
                }
            } else {
                finalBotMessage = response.text;
            }

            const jsonLogRegex = /```json\s*([\s\S]*?)\s*```/;
            const jsonMatch = finalBotMessage.match(jsonLogRegex);
            const patientFacingMessage = finalBotMessage.replace(jsonLogRegex, '').trim();

            // If a JSON log is found, parse it and save it
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const record = JSON.parse(jsonMatch[1]);
                    const recordWithTimestamp = {
                        ...record,
                        timestamp: new Date().toISOString(),
                    };
                    saveRecordToGoogleSheet(recordWithTimestamp);
                    saveRecordLocally(recordWithTimestamp);
                } catch (e) {
                    console.error("Failed to parse or save JSON log:", e);
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', content: patientFacingMessage }]);
            receivedSound.current?.play().catch(e => console.error("Error playing received sound:", e));
    
        } catch (error) {
            console.error("Failed to send message to Gemini API:", { 
                details: "An error occurred during the sendMessage call.",
                userMessage: messageToSend,
                error 
            });

            let userErrorMessage = "တောင်းပန်ပါသည်။ မက်ဆေ့ချ်ပို့ရာတွင် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့သည်။ ကျေးဇူးပြု၍ နောက်တစ်ကြိမ် ထပ်ကြိုးစားကြည့်ပါ။ (Sorry, an error occurred while sending your message. Please try again.)";

            // Check if it's likely a network error
            if (error instanceof Error && error.message.toLowerCase().includes('failed to fetch')) {
                 userErrorMessage = "သင်၏အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။ (Please check your internet connection and try again.)";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', content: userErrorMessage }]);
        } finally {
            setIsLoading(false);
            if (attachment) {
              setAttachment(null);
              setAttachmentPreview(null);
            }
        }
    };    

    const renderPatientForm = () => (
        <div className="form-container">
            <h2>⚕️ Thukha GP Virtual Assistant</h2>
            <p>ကျန်းမာရေးဆိုင်ရာ မေးမြန်းမှုများအတွက် ကျွန်ုပ်တို့၏ virtual assistant နှင့် စတင်ဆွေးနွေးရန် အောက်ပါအချက်အလက်များကို ဖြည့်စွက်ပေးပါ။</p>
            <form onSubmit={handleStartChat} noValidate>
                 <div className="form-input-group">
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="အမည် (Name)"
                        value={patientDetails.name}
                        onChange={handleInputChange}
                        required
                        aria-label="Patient's Name"
                    />
                     {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="patientId"
                        className="form-input"
                        placeholder="လူနာမှတ်ပုံတင်အမှတ် (Patient ID - Optional)"
                        value={patientDetails.patientId}
                        onChange={handleInputChange}
                        aria-label="Patient's ID"
                    />
                </div>
                <div className="form-input-group">
                    <input
                        type="number"
                        name="age"
                        className="form-input"
                        placeholder="အသက် (Age)"
                        value={patientDetails.age}
                        onChange={handleInputChange}
                        required
                        aria-label="Patient's Age"
                    />
                    {formErrors.age && <p className="form-error">{formErrors.age}</p>}
                </div>
                <div className="form-input-group">
                    <select
                        name="sex"
                        className="form-input"
                        value={patientDetails.sex}
                        onChange={handleInputChange}
                        required
                         aria-label="Patient's Sex"
                    >
                        <option value="" disabled>ကျား/မ ရွေးပါ (Select Sex)</option>
                        <option value="Male">ကျား (Male)</option>
                        <option value="Female">မ (Female)</option>
                    </select>
                    {formErrors.sex && <p className="form-error">{formErrors.sex}</p>}
                </div>

                <div className="symptom-checker-group">
                    <label>အဓိကခံစားနေရသော ရောဂါလက္ခဏာများ (Main Symptoms)</label>
                    <div className="symptom-tag-container">
                        {PREDEFINED_SYMPTOMS.map(symptom => (
                            <button
                                type="button"
                                key={symptom.en}
                                className={`symptom-tag ${selectedSymptoms.includes(symptom.en) ? 'selected' : ''}`}
                                onClick={() => handleSymptomToggle(symptom.en)}
                            >
                                {symptom.my}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`symptom-tag ${showOtherSymptomInput ? 'selected' : ''}`}
                            onClick={handleOtherSymptomToggle}
                        >
                            အခြား (Other)
                        </button>
                    </div>
                    {showOtherSymptomInput && (
                        <input
                            type="text"
                            className="other-symptom-input"
                            placeholder="အခြား ရောဂါလက္ခဏာကို ဖြည့်ပါ"
                            value={otherSymptom}
                            onChange={(e) => setOtherSymptom(e.target.value)}
                        />
                    )}
                </div>

                <button type="submit" className="start-chat-btn">
                    စတင်ဆွေးနွေးမည် (Start Chat)
                </button>
            </form>
            <button type="button" className="view-history-btn" onClick={() => setShowHistory(true)}>
                မှတ်တမ်းများကြည့်ရန် (View History)
            </button>
        </div>
    );

    if (showHistory) {
        return <HistoryViewer onClose={() => setShowHistory(false)} />;
    }
    
    if (!isChatStarted) {
        return renderPatientForm();
    }
    
    return (
        <>
            <div className="chat-header">Thukha GP Virtual Assistant</div>
            <div className="chat-window" ref={chatWindowRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender} ${msg.className || ''}`}>
                         {msg.imageUrl && (
                            <img 
                                src={msg.imageUrl} 
                                alt="Attachment" 
                                className="message-image" 
                                onClick={() => setModalImageUrl(msg.imageUrl!)}
                            />
                        )}
                        {/* Render BotMessageContent only for bot messages */}
                        {msg.sender === 'bot' ? <BotMessageContent content={msg.content} /> : msg.content}
                    </div>
                ))}
                 {showTypingIndicator && (
                    <div className="message loading">
                        <div className="typing-indicator">
                            <p>{typingMessage}</p>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                 {attachmentPreview && (
                    <div className="attachment-preview">
                        <img src={attachmentPreview} alt="Attachment Preview" />
                        <button className="remove-attachment-btn" onClick={removeAttachment}>×</button>
                    </div>
                )}
                <div className="chat-input">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                    <button className="attachment-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
                        📎
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="မက်ဆေ့ချ် ပို့ပါ..."
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || (!inputValue.trim() && !attachment)} aria-label="Send Message">
                        ➤
                    </button>
                </div>
            </div>
             {modalImageUrl && <ImageViewerModal src={modalImageUrl} onClose={() => setModalImageUrl(null)} />}
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);