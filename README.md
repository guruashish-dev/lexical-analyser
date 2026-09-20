# Lexical Analyzer Dashboard

A comprehensive lexical analyzer with an animated web dashboard demonstrating real-time tokenization. Built with a LEX-compatible lexer specification and a modern web visualization.

## Features

- **Full LEX Lexer** (`src/lexer.l`) - Complete Flex/Bison compatible lexer specification
- **Animated Web Dashboard** - Real-time tokenization visualization with:
  - Source code editor with syntax highlighting
  - Token flow animation showing tokens as they're generated
  - Current token detail panel with pattern matching info
  - Statistics dashboard with token counts
  - Searchable/filterable token table
  - Regex pattern explorer showing all lexical rules
  - Export tokens as JSON, CSV, or plain text
- **Multiple Sample Programs** - Factorial, Bubble Sort, Complex Expressions
- **Playback Controls** - Play, pause, step-through, reset
- **Speed Control** - Adjustable animation speed (1x-10x)
- **Dark/Light Theme** - With persistence
- **Keyboard Shortcuts** - Ctrl+Enter to analyze, Space to play/pause

## Quick Start

### Web Dashboard (No Compilation Required)

```bash
cd D:\lexical-analyzer
npm install
npm start
```

Then open http://localhost:3000 in your browser.

### Flex Lexer (Requires Flex/GCC)

```bash
# Install Flex on Windows (via Chocolatey)
choco install flex

# Or on WSL/Ubuntu:
sudo apt-get install flex bison gcc

# Compile the lexer
flex -o src/lexer.c src/lexer.l
gcc -o bin/lexer src/lexer.c -lfl

# Test it
echo 'int main() { return 42; }' | ./bin/lexer
```

## Project Structure

```
lexical-analyzer/
├── src/
│   └── lexer.l          # LEX/Flex lexer specification
├── public/
│   ├── index.html       # Main dashboard HTML
│   ├── css/
│   │   └── styles.css   # Complete styling with animations
│   └── js/
│       └── app.js       # Lexer engine + dashboard logic
├── server.js            # Simple Node.js static server
├── package.json         # npm configuration
└── README.md            # This file
```

## Lexer Specification Details

The lexer (`src/lexer.l`) recognizes:

### Keywords
`if`, `else`, `while`, `for`, `return`, `int`, `float`, `char`, `void`, `break`, `continue`, `switch`, `case`, `default`, `do`, `struct`, `class`, `public`, `private`, `static`, `const`, `true`, `false`, `null`, `new`, `delete`, `print`, `function`, `var`, `let`

### Token Types
| Type | Pattern Example | Color |
|------|-----------------|-------|
| KEYWORD | `if`, `while`, `return` | Purple |
| IDENTIFIER | `variable`, `myFunction` | Cyan |
| NUMBER | `42`, `3.14`, `1.5e-2`, `0xFF` | Green |
| OPERATOR | `+`, `-`, `*`, `/`, `==`, `&&`, `++` | Red |
| PUNCTUATION | `{`, `}`, `(`, `)`, `;`, `,` | Gray |
| STRING | `"hello"`, `'c'` | Pink |
| COMMENT | `// comment`, `/* comment */` | Muted |

### Operator Precedence
Multi-character operators are matched before single-character ones (e.g., `==` before `=`).

## Dashboard Usage

1. **Enter Code** - Type or paste C-like code in the left editor
2. **Click Analyze** - Tokenizes and starts animation
3. **Watch Flow** - Center panel shows tokens flowing in real-time
4. **Inspect Details** - Click any token or watch current token details
5. **Filter & Search** - Right panel has filterable token table
6. **Export** - Download tokens as JSON/CSV/TXT

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Enter` | Analyze / Replay |
| `Space` | Play / Pause |
| `S` | Step (when paused) |
| `R` | Reset |
| `Ctrl+S` | Export |

## Screenshots

The dashboard features:
- **Live token highlighting** in source code as tokens are processed
- **Animated token flow** with color-coded tokens sliding in
- **Detailed token inspection** with regex pattern, position, and description
- **Statistics cards** with animated counting
- **Regex pattern reference** showing all lexical rules

## Customization

### Adding New Keywords
Edit `src/lexer.l` and add to the keyword section:
```lex
"mykeyword"    { return MYKEYWORD; }
```
Also add to the regex in `public/js/app.js` LEXER_RULES.

### Adding New Operators
Add to the operator section in `src/lexer.l` (order matters - longer first):
```lex
"==="          { return EQ3; }
"=="           { return EQ; }
```

### Modifying Token Colors
Edit CSS custom properties in `public/css/styles.css`:
```css
:root {
    --token-keyword: #your-color;
    --token-keyword-bg: #your-bg-color;
    /* ... */
}
```

## Requirements

- **Web Dashboard**: Node.js 14+ (for server), any modern browser
- **Flex Lexer**: Flex 2.6+, GCC/Clang

## License

MIT License - Feel free to use for learning, teaching, or projects!