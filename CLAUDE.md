This project is primarily a content website for a small inn.

Best practices
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
- mobile first styling, with (3) breakpoints: mobile, tablet / laptop, large monitors

Integrations
- Hostaway is used for booking and room browsing
- Prismic is the CMS

Git
- Use git in readonly mode. It is fine to compare current local changes to either remote or local git history, but never add, commit or push without permission
