# Address Hunter — The Memory Case

An interactive, browser-only Computer Organization & Architecture (COA) micro-project that teaches CPU addressing modes through a retro detective-style game.

## Project Links

- **GitHub Repository:** https://github.com/Atheena23/Address_Hunter
- **Deployed Application (Vercel):** https://address-hunter.vercel.app/

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Local SVG assets
- Browser LocalStorage for game progress

No backend, database, framework, or build step is required.

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.

Alternatively, visit the deployed application using the Vercel link above.

## Gameplay

Explore the workshop, investigate the computer, solve memory-based cases, identify addressing modes, and follow clues to recover the required values. Complete each case to unlock the next one and access the final Memory Vault.

## COA Concepts Covered

The game contains five cases representing the following addressing modes:

1. **Direct Addressing** — The instruction specifies the memory address containing the operand.
2. **Indirect Addressing** — The specified memory location contains the address of the actual operand.
3. **Register Addressing** — The operand is obtained directly from a CPU register.
4. **Indexed Addressing** — The effective address is calculated using a register value and an offset.
5. **Immediate Addressing** — The operand value is provided directly in the instruction.

Each case uses simplified instruction examples, register values, memory locations, and clues to help players understand how the addressing modes work.

## Features

- Five interactive addressing-mode cases
- Sequential case progression and unlocking
- Interactive case map
- Memory-based challenges and clues
- Retro detective-style interface
- Sound effects and visual feedback
- Memory Vault ending
- Responsive interface for desktop and mobile
- Local browser progress storage

## Project Structure

```text
Address-Hunter/
├── index.html
├── style.css
├── script.js
└── assets/
    └── backgrounds/
        ├── workshop.svg
        ├── room1.svg
        ├── room2.svg
        ├── room3.svg
        ├── room4.svg
        ├── room5.svg
        ├── map.svg
        └── vault.svg
```

## Notes

The game is a frontend-only educational project. It demonstrates addressing modes through simplified examples and does not simulate a complete CPU or execute real machine instructions.

The visual backgrounds and UI assets are local SVG illustrations created for the project. Game progress is stored locally in the browser, where supported by the implementation.

