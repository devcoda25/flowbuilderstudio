export const NODE_COLORS = [
    'hsl(262 83% 58%)', // purple
    'hsl(145 63% 49%)', // green
];

export function getRandomColor(): string {
    return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
}
