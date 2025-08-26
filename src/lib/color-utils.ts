export const NODE_COLORS = [
    'hsl(262 83% 58%)', // purple
    'hsl(145 63% 49%)', // green
    'hsl(210 90% 50%)', // blue
    'hsl(170 80% 40%)', // teal
    'hsl(340 80% 55%)', // pink
];

export function getRandomColor(): string {
    return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
}
