export const SNIPPETS = [
  {
    label: 'Basic if',
    apply: "(country === 'US' && age >= 18)"
  },
  {
    label: 'String contains',
    apply: "includes(message, 'refund')"
  },
  {
    label: 'Regex match',
    apply: "/^\\+?\\d{10,15}$/.test(phone)"
  },
  {
    label: 'In list',
    apply: "inList(country, ['US','CA','GB'])"
  },
  {
    label: 'Time window (minutes)',
    apply: "(minutesSince(lastSeenAt) < 30)"
  }
];
