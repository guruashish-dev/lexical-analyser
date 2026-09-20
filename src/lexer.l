%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

int line_num = 1;
int char_num = 1;

%}

/* Regular expression definitions */
DIGIT       [0-9]
LETTER      [a-zA-Z_]
IDENTIFIER  {LETTER}({LETTER}|{DIGIT})*
NUMBER      {DIGIT}+(\.{DIGIT}+)?([eE][+-]?{DIGIT}+)?
STRING      \"([^\"\\]|\\.)*\"
CHAR        \'([^\'\\]|\\.)*\'
WS          [ \t]+
NEWLINE     \n
COMMENT     //.*|/\*([^*]|\*+[^*/])*\*+/

/* Keywords */
%%
"if"        { return IF; }
"else"      { return ELSE; }
"while"     { return WHILE; }
"for"       { return FOR; }
"return"    { return RETURN; }
"int"       { return INT; }
"float"     { return FLOAT; }
"char"      { return CHAR; }
"void"      { return VOID; }
"break"     { return BREAK; }
"continue"  { return CONTINUE; }
"switch"    { return SWITCH; }
"case"      { return CASE; }
"default"   { return DEFAULT; }

{IDENTIFIER}  { yylval.str = strdup(yytext); return IDENTIFIER; }
{NUMBER}      { yylval.str = strdup(yytext); return NUMBER; }
{STRING}      { yylval.str = strdup(yytext); return STRING_LITERAL; }
{CHAR}        { yylval.str = strdup(yytext); return CHAR_LITERAL; }

"=="          { return EQ; }
"!="          { return NE; }
"<="          { return LE; }
">="          { return GE; }
"<"           { return LT; }
">"           { return GT; }
"="           { return ASSIGN; }
"+"           { return PLUS; }
"-"           { return MINUS; }
"*"           { return MUL; }
"/"           { return DIV; }
"%"           { return MOD; }
"++"          { return INC; }
"--"          { return DEC; }
"&&"          { return AND; }
"||"          { return OR; }
"!"           { return NOT; }
"&"           { return BITWISE_AND; }
"|"           { return BITWISE_OR; }
"^"           { return BITWISE_XOR; }
"~"           { return BITWISE_NOT; }
"<<"          { return SHL; }
">>"          { return SHR; }
"+="          { return PLUS_ASSIGN; }
"-="          { return MINUS_ASSIGN; }
"*="          { return MUL_ASSIGN; }
"/="          { return DIV_ASSIGN; }
"%="          { return MOD_ASSIGN; }
"&="          { return AND_ASSIGN; }
"|="          { return OR_ASSIGN; }
"^="          { return XOR_ASSIGN; }
"<<="         { return SHL_ASSIGN; }
">>="         { return SHR_ASSIGN; }

"("           { return LPAREN; }
")"           { return RPAREN; }
"{"           { return LBRACE; }
"}"           { return RBRACE; }
"["           { return LBRACKET; }
"]"           { return RBRACKET; }
";"           { return SEMICOLON; }
","           { return COMMA; }
"."           { return DOT; }
":"           { return COLON; }
"?"           { return TERNARY; }
"->"          { return ARROW; }

{WS}          { /* ignore whitespace */ }
{NEWLINE}     { line_num++; char_num = 1; }
{COMMENT}     { /* ignore comments */ }
.             { fprintf(stderr, "Unknown character: %c at line %d\n", *yytext, line_num); }

%%

int yywrap() {
    return 1;
}

int main(int argc, char **argv) {
    if (argc > 1) {
        yyin = fopen(argv[1], "r");
        if (!yyin) {
            fprintf(stderr, "Cannot open file: %s\n", argv[1]);
            return 1;
        }
    } else {
        yyin = stdin;
    }

    int token;
    while ((token = yylex()) != 0) {
        printf("Token: %d, Text: %s, Line: %d\n", token, yytext, line_num);
    }

    if (yyin != stdin) {
        fclose(yyin);
    }
    return 0;
}