import fs from 'fs';
import path from 'path';

const filesToProcess = [
  'src/app/page.tsx',
  'src/app/(client)/halls/page.tsx',
  'src/app/(client)/halls/[hallId]/page.tsx',
  'src/app/(client)/my-bookings/page.tsx',
  'src/app/(client)/favorites/page.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx'
];

const emojiMap = {
  // Action/Nav Emojis
  '🏛️': '<Building className="inline-icon" size={18} />',
  '✨': '<Sparkles className="inline-icon" size={18} />',
  '📅': '<CalendarDays className="inline-icon" size={18} />',
  '🤍': '<Heart size={18} />',
  '❤️': '<Heart size={18} fill="currentColor" />',
  '🔍': '<Search className="inline-icon" size={24} />',
  '💳': '<CreditCard className="inline-icon" size={24} />',
  '💐': '<Flower className="inline-icon" size={24} />',
  '📞': '<Phone className="inline-icon" size={18} />',
  '📱': '<Smartphone className="inline-icon" size={18} />',
  '💬': '<MessageSquare className="inline-icon" size={18} />',
  '🎀': '<Gift className="inline-icon" size={18} />',
  '✅': '<CheckCircle2 className="inline-icon" size={18} />',
  '🔒': '<Lock className="inline-icon" size={18} />',
  '💰': '<Coins className="inline-icon" size={18} />',
  '👥': '<Users className="inline-icon" size={18} />',
  '⭐': '<Star size={18} fill="currentColor" className="inline-icon text-gold" />',
  '★': '<Star size={14} fill="currentColor" className="inline-icon text-gold" style={{ marginTop: "-2px" }} />',
  '📍': '<MapPin className="inline-icon" size={16} />',
  '🚗': '<Car className="inline-icon" size={24} />',
  '🚇': '<Train className="inline-icon" size={24} />',
  '❄️': '<Wind className="inline-icon" size={18} />',
  '🎤': '<Mic className="inline-icon" size={18} />',
  '💡': '<Lightbulb className="inline-icon" size={18} />',
  '📷': '<Camera className="inline-icon" size={18} />',
  '🍽️': '<Utensils className="inline-icon" size={18} />',
  '♿': '<Accessibility className="inline-icon" size={18} />',
  '🅿️': '<ParkingSquare className="inline-icon" size={18} />',
  '🔴': '<XCircle size={14} fill="currentColor" className="text-danger inline-icon" />',
  '⚪': '<Circle size={14} className="text-muted inline-icon" />',
  '🎉': '<PartyPopper className="inline-icon" size={18} />',
};

const lucideImportsRequired = new Set();

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileImportsRequired = new Set();

  for (const [emoji, replacement] of Object.entries(emojiMap)) {
    if (content.includes(emoji)) {
      // Find the component name from the replacement string
      const match = replacement.match(/<([A-Z][a-zA-Z0-9]*)/);
      if (match) {
        fileImportsRequired.add(match[1]);
      }
      
      // We need to handle cases where emojis are inside JSX vs inside strings.
      // E.g. "📍 Toshkent" -> <MapPin /> " Toshkent"
      // This is a naive replacement. For strings it will break JSX if not careful.
      // Wait, replacing '📍 ' inside a string like `📍 ${hall.city}` breaks if we just use JSX.
      // We'll replace it carefully.
      
      // Let's do a basic global replace and fix up syntax errors manually afterwards if needed,
      // OR we can just use string replacement for simple ones, and for string templates we convert them.
      // Actually, since this is a complex refactor, it's safer to just inject the lucide icons.
      
      // To avoid breaking strings, let's only replace if it's not inside a template string variable or we change the template string to JSX.
      // A better way: I'll just apply it and check manually or let the compiler tell us.
    }
  }

  if (fileImportsRequired.size > 0) {
    const importStr = `import { ${Array.from(fileImportsRequired).join(', ')} } from 'lucide-react';\n`;
    // Add import after other imports
    const lastImportIndex = content.lastIndexOf("import ");
    if (lastImportIndex !== -1) {
      const endOfImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfImport + 1) + importStr + content.slice(endOfImport + 1);
    } else {
      content = importStr + content;
    }
    
    // Naive replacement
    for (const [emoji, replacement] of Object.entries(emojiMap)) {
      if (content.includes(emoji)) {
          // If the emoji is inside a quote like '📍', it breaks if we replace it with <MapPin/>
          // Let's replace '📍 ' with <MapPin/> inside JSX
          // This is too fragile for a simple script. 
      }
    }
  }
}

// Actually, writing a perfect regex replacer is hard. 
// Let's use multi_replace_file_content for precision. I will delete this script.
