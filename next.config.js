/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stops `next dev` from regenerating AGENTS.md / CLAUDE.md on every run.
  agentRules: false,
};

module.exports = nextConfig;
