export const exampleQueries = [
  "Failed login in last 24h",
  "Top 10 IP co nhieu alert nhat",
  "SS event theo gio trong 24h qua",
  "Critical events by host",
];

export const emptyDsl = {
  size: 0,
  query: {
    bool: {
      filter: [],
    },
  },
};
