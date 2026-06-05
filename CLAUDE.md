This project is primarily a content website for a small inn.

Development best practices -- ask for confirmation if you need to deviate from these:
- Use the astro cli for initial configuration, where ever possible. If overrides are needed, do that after running the CLI. 
- By default, install node packages using `npm install`, rather than editing package.json to set a specific version directly.
- Use git in readonly mode. It is fine to compare current local changes to either remote or local git history, but never add, commit or push without permission

General Best practices
- Leverage Astro.JS's static first preference. the website should load fast on poor internet
- Leverage SEO best practices
- Leverage Accessibility best practices
- Leverage data privacy and web security best practices
- Use Typescript in strict mode
- With the exception of one line if statements optional
- Wrap any dependencies so they are easy to swap out
- When it comes to components, prefer composability over configuration

Styling
- Compose Tailwind classnames for most styling. There may be on global reset.css file. Otherwise use inline styling for rare overrides.
- The layout follows a 6 column grid for mobile and 8 column grid for desktop. Generally prefer CSS grid or flexbox rather than setting sizes explicitly or based on percentages, unless there is a valid reason
- Use UI primitive components like TextStyle, Button, Link, FormInput to maintain consistency wherever possible.
- mobile first styling, with (3) breakpoints: mobile, tablet / laptop, large monitors

Integrations
- Hostaway is used for booking and room browsing
- Prismic is the CMS

