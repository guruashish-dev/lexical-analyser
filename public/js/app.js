/* ============================================================
   Lexical Analyzer Dashboard - Main Application
   ============================================================ */

// --- Token type definitions with colors and regex patterns ---
const TOKEN_TYPES = {
    KEYWORD: {
        value: 'keyword',
        label: 'Keyword',
        color: 'var(--token-keyword)',
        bg: 'var(--token-keyword-bg)',
        desc: 'Reserved words with special meaning',
    },
    IDENTIFIER: {
        value: 'identifier',
        label: 'Identifier',
        color: 'var(--token-identifier)',
        bg: 'var(--token-identifier-bg)',
        desc: 'Variable and function names',
    },
    NUMBER: {
        value: 'number',
        label: 'Number',
        color: 'var(--token-number)',
        bg: 'var(--token-number-bg)',
        desc: 'Integer and floating-point literals',
    },
    OPERATOR: {
        value: 'operator',
        label: 'Operator',
        color: 'var(--token-operator)',
        bg: 'var(--token-operator-bg)',
        desc: 'Arithmetic and logical operators',
    },
    PUNCTUATION: {
        value: 'punctuation',
        label: 'Punctuation',
        color: 'var(--token-punctuation)',
        bg: 'var(--token-punctuation-bg)',
        desc: 'Brackets, parentheses, separators',
    },
    STRING: {
        value: 'string',
        label: 'String',
        color: 'var(--token-string)',
        bg: 'var(--token-string-bg)',
        desc: 'String and character literals',
    },
    COMMENT: {
        value: 'comment',
        label: 'Comment',
        color: 'var(--token-comment)',
        bg: 'var(--token-comment-bg)',
        desc: 'Source code comments',
    },
};

// --- Lexer Rules (Order matters!) ---
const LEXER_RULES = [
    // Comments
    { type: 'COMMENT', regex: /\/\/.*/, desc: 'Single-line comment' },
    { type: 'COMMENT', regex: /\/\*[\s\S]*?\*\//, desc: 'Multi-line comment' },

    // Keywords (checked before identifiers)
    { type: 'KEYWORD', regex: /\b(if|else|while|for|return|int|float|char|void|break|continue|switch|case|default|do|struct|class|public|private|static|const|true|false|null|new|delete|print|function|var|let|double|long|short|unsigned|signed|enum|typedef|sizeof|typedef)\b/, desc: 'Reserved keyword' },

    // Identifiers
    { type: 'IDENTIFIER', regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/, desc: 'Identifier pattern: [a-zA-Z_][a-zA-Z0-9_]*' },

    // Strings
    { type: 'STRING', regex: /"(?:[^"\\]|\\.)*"/, desc: 'Double-quoted string literal' },
    { type: 'STRING', regex: /'(?:[^'\\]|\\.)*'/, desc: 'Single-quoted string/char literal' },

    // Numbers (with scientific notation)
    { type: 'NUMBER', regex: /\b\d+\.\d+(?:[eE][+-]?\d+)?\b/, desc: 'Float with decimal' },
    { type: 'NUMBER', regex: /\b\d+[eE][+-]?\d+\b/, desc: 'Scientific notation' },
    { type: 'NUMBER', regex: /\b0[xX][0-9a-fA-F]+\b/, desc: 'Hexadecimal literal' },
    { type: 'NUMBER', regex: /\b\d+\b/, desc: 'Integer literal' },

    // Multi-char operators
    { type: 'OPERATOR', regex: /(===|!==|==|!=|<=|>=|<<|>>|&&|\|\||\+\+|--|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|\.\.\.)/, desc: 'Compound operator' },

    // Single-char operators
    { type: 'OPERATOR', regex: /[+\-*/%=<>!&|^~?:]/, desc: 'Single-char operator' },

    // Punctuation
    { type: 'PUNCTUATION', regex: /[{}()\[\];,.\->]/, desc: 'Punctuation symbol' },

    // Whitespace (skipped)
    { type: 'WHITESPACE', regex: /\s+/, desc: 'Whitespace (skipped)' },

    // Unknown character
    { type: 'UNKNOWN', regex: /[^]/, desc: 'Unknown character' },
];

// --- Sample Code ---
const SAMPLE_CODES = [
    {
        name: 'Factorial Function',
        code: `// Calculate factorial of n
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    int result = n * factorial(n - 1);
    return result;
}

int main() {
    int num = 5;
    print("Factorial: " + factorial(num));
    return 0;
}`,
    },
    {
        name: 'Bubble Sort',
        code: `// Bubble sort implementation
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    },
    {
        name: 'Complex Expression',
        code: `float compute(float x, float y) {
    float sum = 0.0;
    for (int i = 1; i <= 10; i++) {
        sum += (x * y) / (float)i + 3.14e-2;
    }
    while (sum < 100.5 && y > 0) {
        sum *= 1.5;
        y -= 0.1;
    }
    return sum >= 50.0 ? sum : -1.0;
}`,
    },
];

// ============================================================
// State Management
// ============================================================
const State = {
    tokens: [],
    currentIndex: -1,
    isPlaying: false,
    isPaused: false,
    speed: 5,
    theme: 'light',
    maxVisibleTokens: 8,
    animationTimer: null,
    stats: {
        keyword: 0, identifier: 0, number: 0,
        operator: 0, punctuation: 0, string: 0, comment: 0,
    },
};

// ============================================================
// DOM Elements
// ============================================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    codeEditor: $('#codeEditor'),
    lineNumbers: $('#lineNumbers'),
    editorOverlay: $('#editorOverlay'),
    cursorPosition: $('#cursorPosition'),
    charCount: $('#charCount'),
    loadSampleBtn: $('#loadSampleBtn'),
    clearBtn: $('#clearBtn'),
    analyzeBtn: $('#analyzeBtn'),
    pauseBtn: $('#pauseBtn'),
    stepBtn: $('#stepBtn'),
    resetBtn: $('#resetBtn'),
    sourceView: $('#sourceView'),
    sourceLineNumbers: $('#sourceLineNumbers'),
    sourceCode: $('#sourceCode'),
    flowItems: $('#flowItems'),
    flowLegend: $('#flowLegend'),
    detailContent: $('#detailContent'),
    statusIndicator: $('#statusIndicator'),
    themeToggle: $('#themeToggle'),
    speedSlider: $('#speedSlider'),
    speedValue: $('#speedValue'),
    filterSelect: $('#filterSelect'),
    exportBtn: $('#exportBtn'),
    tokenTableBody: $('#tokenTableBody'),
    tableEmpty: $('#tableEmpty'),
    statsGrid: $('#statsGrid'),
    patternsGrid: $('#patternsGrid'),
    toastContainer: $('#toastContainer'),
    exportModal: $('#exportModal'),
    closeExportModal: $('#closeExportModal'),
    confirmExport: $('#confirmExport'),
};

// ============================================================
// Utility Functions
// ============================================================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatRegex(pattern) {
    return pattern.toString()
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replace(/\\b/g, '\\b');
}

function getTokenColor(type) {
    return TOKEN_TYPES[type]?.color || 'var(--text-primary)';
}

function getTokenBg(type) {
    return TOKEN_TYPES[type]?.bg || 'var(--bg-tertiary)';
}

// ============================================================
// Lexer Engine
// ============================================================
class Lexer {
    constructor() {
        this.rules = LEXER_RULES.map(r => ({
            ...r,
            compiled: new RegExp('^(?:' + formatRegex(r.regex) + ')'),
        }));
    }

    tokenize(source) {
        const tokens = [];
        let pos = 0;
        let line = 1;
        let col = 1;
        const len = source.length;

        while (pos < len) {
            const remaining = source.slice(pos);

            // Skip if we're at a line break
            if (remaining[0] === '\n') {
                pos++;
                line++;
                col = 1;
                continue;
            }

            let matched = false;

            for (const rule of this.rules) {
                const match = rule.compiled.exec(remaining);
                if (match && match[0].length > 0) {
                    const text = match[0];

                    if (rule.type !== 'WHITESPACE' && rule.type !== 'UNKNOWN') {
                        tokens.push({
                            type: rule.type,
                            value: text,
                            line,
                            col,
                            length: text.length,
                            startPos: pos,
                            pattern: formatRegex(rule.regex),
                            desc: rule.desc,
                        });
                    } else if (rule.type === 'UNKNOWN') {
                        // Report unknown character
                        tokens.push({
                            type: 'UNKNOWN',
                            value: text,
                            line,
                            col,
                            length: text.length,
                            startPos: pos,
                            pattern: 'N/A',
                            desc: 'Unknown character',
                            error: true,
                        });
                    }

                    pos += text.length;
                    col += text.length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // This shouldn't happen due to UNKNOWN rule, but safety check
                pos++;
                col++;
            }
        }

        // Add EOF token
        tokens.push({
            type: 'EOF',
            value: '',
            line,
            col,
            length: 0,
            startPos: pos,
            pattern: 'N/A',
            desc: 'End of file',
        });

        return tokens;
    }
}

const lexer = new Lexer();

// ============================================================
// Animation Controller
// ============================================================
class AnimationController {
    constructor() {
        this.callbacks = {};
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }
}

const animator = new AnimationController();

// ============================================================
// Core Functions
// ============================================================

function updateLineNumbers() {
    const text = elements.codeEditor.value;
    const lines = text.split('\n');
    elements.lineNumbers.innerHTML = lines
        .map((_, i) => `<div class="line-number" data-line="${i + 1}">${i + 1}</div>`)
        .join('');
}

function updateEditorFooter() {
    const text = elements.codeEditor.value;
    const lines = text.split('\n');
    const pos = elements.codeEditor.selectionStart;
    const beforePos = text.slice(0, pos);
    const lineNum = beforePos.split('\n').length;
    const colNum = pos - beforePos.lastIndexOf('\n');

    elements.cursorPosition.textContent = `Ln ${lineNum}, Col ${colNum}`;
    elements.charCount.textContent = `${text.length} characters`;
}

function analyzeCode() {
    const source = elements.codeEditor.value;
    if (!source.trim()) {
        showToast('Please enter some code first', 'warning');
        return;
    }

    // Tokenize
    State.tokens = lexer.tokenize(source);
    State.currentIndex = -1;
    State.isPlaying = false;
    State.isPaused = false;

    // Compute stats
    computeStats();

    // Render source code view
    renderSourceView();

    // Render token table
    renderTokenTable();

    // Render flow legend
    renderFlowLegend();

    // Enable controls
    elements.analyzeBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.stepBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.exportBtn.disabled = false;

    setStatus('ready', 'Analyzed - Ready to Play');

    showToast(`Found ${State.tokens.length - 1} tokens`, 'success');
}

function computeStats() {
    State.stats = {
        keyword: 0, identifier: 0, number: 0,
        operator: 0, punctuation: 0, string: 0, comment: 0,
    };

    for (const token of State.tokens) {
        if (State.stats[token.type] !== undefined) {
            State.stats[token.type]++;
        }
        if (token.type === 'STRING') {
            State.stats.string++;
        }
    }

    // Update stat cards with animation
    Object.keys(State.stats).forEach((key) => {
        const el = $(`#stat${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (el) {
            animateValue(el, 0, State.stats[key], 500);
        }
    });
}

function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(start + (end - start) * eased);
        el.textContent = value;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function renderSourceView() {
    const source = elements.codeEditor.value;
    const lines = source.split('\n');

    // Line numbers
    elements.sourceLineNumbers.innerHTML = lines
        .map((_, i) => `<div class="line-number" data-line="${i + 1}">${i + 1}</div>`)
        .join('');

    // Render tokens as spans
    let html = '';
    for (const token of State.tokens) {
        if (token.type === 'EOF') continue;
        const cls = `token ${token.type.toLowerCase()}`;
        const escaped = escapeHtml(token.value);
        html += `<span class="${cls}" data-index="${token.startPos}" title="${token.type}: ${token.value}">${escaped}</span>`;
    }
    elements.sourceCode.innerHTML = html;
}

function renderTokenTable() {
    const filter = elements.filterSelect.value;
    const body = elements.tokenTableBody;
    body.innerHTML = '';

    let count = 0;
    for (let i = 0; i < State.tokens.length; i++) {
        const token = State.tokens[i];
        if (token.type === 'EOF') continue;
        if (filter !== 'all' && token.type.toLowerCase() !== filter) continue;

        const row = document.createElement('tr');
        row.dataset.index = i;
        row.innerHTML = `
            <td>${count + 1}</td>
            <td><span class="token-type-badge ${token.type.toLowerCase()}">${token.type}</span></td>
            <td class="token-lexeme">${escapeHtml(token.value)}</td>
            <td class="token-position">${token.line}:${token.col}</td>
            <td class="token-position">${token.length}</td>
            <td class="token-pattern">${token.pattern}</td>
        `;
        body.appendChild(row);
        count++;
    }

    elements.tableEmpty.style.display = count === 0 ? 'block' : 'none';
}

function renderFlowLegend() {
    const legend = elements.flowLegend;
    legend.innerHTML = Object.values(TOKEN_TYPES)
        .map((t) => `
            <div class="legend-item">
                <span class="legend-color" style="background: ${t.color}"></span>
                <span>${t.label}</span>
            </div>
        `)
        .join('');
}

function highlightSourceToken(index) {
    const spans = elements.sourceCode.querySelectorAll('.token');
    spans.forEach((span) => span.classList.remove('current', 'processed'));

    if (index >= 0 && index < State.tokens.length) {
        const token = State.tokens[index];
        if (token.type !== 'EOF') {
            // Find the span at this position (use startPos)
            const target = elements.sourceCode.querySelector(`.token[data-index="${token.startPos}"]`);
            if (target) {
                target.classList.add('current');
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
            // Mark all before as processed
            for (let i = 0; i < index; i++) {
                const t = State.tokens[i];
                if (t.type !== 'EOF') {
                    const prev = elements.sourceCode.querySelector(`.token[data-index="${t.startPos}"]`);
                    if (prev) prev.classList.add('processed');
                }
            }
        }
    }
}

function addFlowItem(token, index) {
    const item = document.createElement('div');
    item.className = `flow-item ${token.type.toLowerCase()}`;
    item.dataset.index = index;
    item.innerHTML = `
        <span class="flow-item-index">${index}</span>
        <span class="flow-item-type">${token.type}</span>
        <span class="flow-item-lexeme">${escapeHtml(token.value)}</span>
        <span class="flow-item-position">${token.line}:${token.col}</span>
    `;
    elements.flowItems.appendChild(item);

    // Limit visible items
    const items = elements.flowItems.children;
    if (items.length > State.maxVisibleTokens) {
        const first = items[0];
        first.classList.add('exiting');
        setTimeout(() => first.remove(), 300);
    }
}

function showTokenDetail(token, index) {
    if (token.type === 'EOF') {
        elements.detailContent.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Token #</span>
                <span class="detail-value">${index}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value highlight">EOF</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Meaning</span>
                <span class="detail-value">End of file reached</span>
            </div>
        `;
        return;
    }

    const typeInfo = TOKEN_TYPES[token.type] || { color: 'var(--text-primary)', label: token.type };
    elements.detailContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Token #</span>
            <span class="detail-value">${index}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type</span>
            <span class="detail-value highlight" style="color: ${typeInfo.color}">${token.type}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Lexeme</span>
            <span class="detail-value">"${escapeHtml(token.value)}"</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Position</span>
            <span class="detail-value">Line ${token.line}, Col ${token.col}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Length</span>
            <span class="detail-value">${token.length} chars</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Pattern</span>
            <span class="detail-value">${token.pattern}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">${token.desc}</span>
        </div>
    `;
}

function highlightTableRow(index) {
    const rows = elements.tokenTableBody.querySelectorAll('tr');
    rows.forEach((row) => row.classList.remove('current-row'));

    const target = elements.tokenTableBody.querySelector(`tr[data-index="${index}"]`);
    if (target) {
        target.classList.add('current-row');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function processNextToken() {
    if (State.currentIndex >= State.tokens.length - 1) {
        // Done
        State.isPlaying = false;
        State.currentIndex = State.tokens.length - 1;
        setStatus('complete', 'Analysis Complete');
        elements.pauseBtn.disabled = true;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.querySelector('span').textContent = 'Replay';
        return false;
    }

    State.currentIndex++;
    const token = State.tokens[State.currentIndex];

    if (token.type !== 'EOF') {
        highlightSourceToken(State.currentIndex);
        addFlowItem(token, State.currentIndex);
        showTokenDetail(token, State.currentIndex);
        highlightTableRow(State.currentIndex);

        // Highlight line in source editor
        highlightEditorLine(token.line);
    } else {
        showTokenDetail(token, State.currentIndex);
    }

    return true;
}

function highlightEditorLine(lineNum) {
    // Highlight current line in line numbers
    const lineNumbers = elements.lineNumbers.querySelectorAll('.line-number');
    lineNumbers.forEach((ln) => ln.classList.remove('current'));
    const current = elements.lineNumbers.querySelector(`[data-line="${lineNum}"]`);
    if (current) current.classList.add('current');
}

async function playAnalysis() {
    if (State.isPlaying) return;

    State.isPlaying = true;
    State.isPaused = false;
    setStatus('processing', 'Analyzing...');
    elements.pauseBtn.disabled = false;
    elements.pauseBtn.querySelector('span').textContent = 'Pause';

    const speed = getSpeedInterval();

    while (State.isPlaying && !State.isPaused) {
        const hasMore = processNextToken();
        if (!hasMore) break;
        await delay(speed);
    }
}

function pauseAnalysis() {
    if (!State.isPlaying) return;

    State.isPaused = true;
    State.isPlaying = false;
    setStatus('ready', 'Paused');
    elements.pauseBtn.querySelector('span').textContent = 'Resume';
    elements.pauseBtn.onclick = resumeAnalysis;
}

function resumeAnalysis() {
    State.isPaused = false;
    State.isPlaying = false;
    elements.pauseBtn.querySelector('span').textContent = 'Pause';
    elements.pauseBtn.onclick = pauseAnalysis;
    playAnalysis();
}

function stepAnalysis() {
    if (State.isPlaying) {
        pauseAnalysis();
        return;
    }

    setStatus('processing', 'Stepping...');
    const hasMore = processNextToken();
    if (!hasMore) {
        setStatus('complete', 'Analysis Complete');
        elements.pauseBtn.disabled = true;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.querySelector('span').textContent = 'Replay';
    } else {
        setTimeout(() => setStatus('ready', 'Paused'), 100);
    }
}

function resetAnalysis() {
    State.isPlaying = false;
    State.isPaused = false;
    State.currentIndex = -1;

    // Clear visualizations
    elements.flowItems.innerHTML = '';
    elements.sourceCode.querySelectorAll('.token').forEach((t) => {
        t.classList.remove('current', 'processed');
    });
    elements.tokenTableBody.querySelectorAll('tr').forEach((row) => {
        row.classList.remove('current-row');
    });
    elements.lineNumbers.querySelectorAll('.line-number').forEach((ln) => {
        ln.classList.remove('current');
    });
    elements.detailContent.innerHTML = '<div class="detail-placeholder">Click "Analyze" to start tokenization</div>';

    setStatus('ready', 'Ready');
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.querySelector('span').textContent = 'Pause';
    elements.pauseBtn.onclick = pauseAnalysis;
    elements.analyzeBtn.disabled = false;
    elements.analyzeBtn.querySelector('span').textContent = 'Analyze';
}

function getSpeedInterval() {
    // Speed: 1-10, interval: 1000ms - 100ms
    const speed = State.speed;
    return Math.max(100, 1100 - speed * 100);
}

function setStatus(state, text) {
    elements.statusIndicator.className = `status-indicator ${state}`;
    elements.statusIndicator.querySelector('.status-text').textContent = text;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('exiting');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// Regex Pattern Explorer
// ============================================================
function renderPatterns() {
    const patterns = [
        { name: 'Identifier', type: 'regex', regex: '\\b[a-zA-Z_][a-zA-Z0-9_]*\\b', desc: 'Starts with letter/underscore, followed by alphanumerics' },
        { name: 'Integer', type: 'regex', regex: '\\b\\d+\\b', desc: 'One or more digits' },
        { name: 'Float', type: 'regex', regex: '\\b\\d+\\.\\d+\\b', desc: 'Digits with decimal point' },
        { name: 'Hex', type: 'regex', regex: '\\b0[xX][0-9a-fA-F]+\\b', desc: 'Hexadecimal literal' },
        { name: 'String', type: 'regex', regex: '"(?:[^"\\\\]|\\\\.)*"', desc: 'Double-quoted string' },
        { name: 'Char', type: 'regex', regex: "'(?:[^'\\\\]|\\\\.)*'", desc: 'Single-quoted char' },
        { name: 'Line Comment', type: 'regex', regex: '//.*', desc: 'C++ style comment' },
        { name: 'Block Comment', type: 'regex', regex: '/\\*[\\s\\S]*?\\*/', desc: 'C style comment' },
        { name: 'Operators', type: 'regex', regex: '[+\\-*/%=<>!&|^~?:]', desc: 'Single-char operators' },
        { name: 'Compound Ops', type: 'regex', regex: '(===|!==|==|<=|>=|<<|>>|&&|\\|\\||\\+\\+|--)', desc: 'Multi-char operators' },
        { name: 'if/else', type: 'keyword', regex: '\\b(if|else)\\b', desc: 'Conditional keywords' },
        { name: 'Loop', type: 'keyword', regex: '\\b(for|while|do)\\b', desc: 'Loop keywords' },
    ];

    elements.patternsGrid.innerHTML = patterns.map((p) => `
        <div class="pattern-card">
            <div class="pattern-header">
                <span class="pattern-name">${p.name}</span>
                <span class="pattern-type ${p.type}">${p.type}</span>
            </div>
            <div class="pattern-regex">${p.regex}</div>
            <div class="pattern-description">${p.desc}</div>
        </div>
    `).join('');
}

// ============================================================
// Export Functions
// ============================================================
function exportTokens(format) {
    if (State.tokens.length === 0) {
        showToast('No tokens to export', 'warning');
        return;
    }

    let content = '';
    let filename = 'tokens';
    let mime = 'text/plain';

    if (format === 'json') {
        content = JSON.stringify(State.tokens, null, 2);
        filename = 'tokens.json';
        mime = 'application/json';
    } else if (format === 'csv') {
        content = 'Index,Type,Value,Line,Column,Length,Pattern\n';
        State.tokens.forEach((t, i) => {
            if (t.type === 'EOF') return;
            content += `${i},${t.type},"${t.value.replace(/"/g, '""')}",${t.line},${t.col},${t.length},"${t.pattern}"\n`;
        });
        filename = 'tokens.csv';
        mime = 'text/csv';
    } else {
        content = State.tokens
            .filter((t) => t.type !== 'EOF')
            .map((t, i) => `${i + 1}. [${t.type}] ${t.value} (Line ${t.line}, Col ${t.col})`)
            .join('\n');
        filename = 'tokens.txt';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported as ${format.toUpperCase()}`, 'success');
}

// ============================================================
// Theme Toggle
// ============================================================
function toggleTheme() {
    State.theme = State.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('lex-theme', State.theme);
}

function initTheme() {
    const saved = localStorage.getItem('lex-theme') || 'light';
    State.theme = saved;
    document.documentElement.setAttribute('data-theme', saved);
}

// ============================================================
// Event Listeners
// ============================================================
function initEventListeners() {
    // Code editor
    elements.codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        updateEditorFooter();
        elements.analyzeBtn.disabled = !elements.codeEditor.value.trim();
    });

    elements.codeEditor.addEventListener('keyup', updateEditorFooter);
    elements.codeEditor.addEventListener('click', updateEditorFooter);
    elements.codeEditor.addEventListener('scroll', () => {
        elements.lineNumbers.scrollTop = elements.codeEditor.scrollTop;
    });

    // Buttons
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.clearBtn.addEventListener('click', clearCode);
    elements.analyzeBtn.addEventListener('click', () => {
        resetAnalysis();
        analyzeCode();
        playAnalysis();
    });
    elements.pauseBtn.addEventListener('click', pauseAnalysis);
    elements.stepBtn.addEventListener('click', stepAnalysis);
    elements.resetBtn.addEventListener('click', resetAnalysis);

    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Speed
    elements.speedSlider.addEventListener('input', (e) => {
        State.speed = parseInt(e.target.value);
        elements.speedValue.textContent = `${State.speed}x`;
    });

    // Filter
    elements.filterSelect.addEventListener('change', renderTokenTable);

    // Export
    elements.exportBtn.addEventListener('click', () => {
        elements.exportModal.classList.add('open');
    });
    elements.closeExportModal.addEventListener('click', () => {
        elements.exportModal.classList.remove('open');
    });
    elements.exportModal.addEventListener('click', (e) => {
        if (e.target === elements.exportModal) {
            elements.exportModal.classList.remove('open');
        }
    });
    elements.confirmExport.addEventListener('click', () => {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        exportTokens(format);
        elements.exportModal.classList.remove('open');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'Enter') {
                e.preventDefault();
                elements.analyzeBtn.click();
            } else if (e.key === 's') {
                e.preventDefault();
                elements.exportBtn.click();
            }
        }
        if (e.key === ' ' && document.activeElement !== elements.codeEditor) {
            e.preventDefault();
            if (State.isPlaying) {
                pauseAnalysis();
            } else if (State.currentIndex >= 0) {
                resumeAnalysis();
            } else {
                elements.analyzeBtn.click();
            }
        }
    });
}

function loadSample() {
    const random = SAMPLE_CODES[Math.floor(Math.random() * SAMPLE_CODES.length)];
    elements.codeEditor.value = random.code;
    updateLineNumbers();
    updateEditorFooter();
    elements.analyzeBtn.disabled = false;
    showToast(`Loaded: ${random.name}`, 'info');
}

function clearCode() {
    elements.codeEditor.value = '';
    updateLineNumbers();
    updateEditorFooter();
    elements.analyzeBtn.disabled = true;
    resetAnalysis();
}

// ============================================================
// Initialization
// ============================================================
function init() {
    initTheme();
    initEventListeners();
    renderPatterns();
    updateLineNumbers();
    updateEditorFooter();
    loadSample(); // Load a sample on start
    setStatus('ready', 'Ready');
}

document.addEventListener('DOMContentLoaded', init);
