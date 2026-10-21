Issues to consider in requirements.md

    1. OpenGraph / Social meta tags per section 
    The Layout.astro likely has basic meta, but dynamic OG images (e.g. a project card as an OG image) would make shares look professional.
    This is table-stakes for a portfolio in 2025. (High priority)

    <thought>
    Understanding the Dynamic Template URL

    Before diving into finding your specific template URL, let's first understand what an Dynamic Template URL is and how it works.

    An Dynamic Template URL is a structured web address uniquely designed by our platform. It dynamically generates an OG image based on the parameters you input. Think of it as a customizable template for your OG images.

    Try It Yourself: Interactive Example

    To illustrate this concept, we've created a very basic example template. This template is intentionally simple, featuring just text within an image with a large border, to demonstrate the principle of dynamic generation.

    Here's a straightforward template URL for you to experiment with:

    https://ogcdn.net/e23b4a4f-83c2-4d9b-addb-051de54d819c/v1/{title_text}/og.png

    This URL contains a placeholder {title_text} where you can insert your own text. For example:

    https://ogcdn.net/e23b4a4f-83c2-4d9b-addb-051de54d819c/v1/This%20is%20an%20example%20of%20an%20automatically%20generated%20OG%20Image/og.png

    From this we could also add retry-fails in sections that purely rely on http urls as sources for resource media.

    I could set up a monitor-and-alert system that sends pings on fails upon a couple of retries. I will write failover refactor later.

    Feel free to modify the text after /v1/ in the URL.

    Implementing Your Template URL

    Now that you have your template URL, the next step is to implement it on your website. This involves dynamically generating unique OG images for each page or post by replacing placeholders in the template URL with actual content data.
    Understanding and Utilizing Your Template URL

    Your template URL will look something like this:

    https://ogcdn.net/.../.../{site_text}/{title_text}/{description_text}/{image_url}/og.png

    Each bracketed section {} is a placeholder for dynamic content. The key to using this URL effectively is to replace these placeholders with real data corresponding to each specific page or post.
    Example: Replacing Placeholders

    Here's how you can replace these placeholders in different programming environments:
    JavaScript Example

    In a JavaScript environment, you might fetch data from your webpage and dynamically construct the URL like this:

    const title = encodeURIComponent(document.title);
    const description = encodeURIComponent("Your page description here");
    const imageUrl = encodeURIComponent("https://yourdomain.com/path/to/image.jpg");

    //template settings
    const templateId = 'e23b4a4f-83c2-4d9b-addb-051de54d819c';
    const versionNumber = 1;

    const templateURL = `https://ogcdn.net/${templateId}/v${versionNumber}/${title}/${description}/${imageUrl}/og.png`;
    </thought>

    In this example for Next.js, the necessary variables (title, description, imageUrl, templateId, and versionNumber) are defined within the component. These variables are then used to construct the templateURL, which is inserted into the og:image meta tag within the <Head> component. This setup ensures that the dynamic OG image URL is appropriately rendered for social media sharing.

    Aptly refactor for this within layout as well.

    2. Keyboard navigation & accessibility audit

    The skill bento grid, music cards, and project hover overlays are all mouse-only right now.

    Tab focus, ARIA labels, and keyboard-triggered overlays are missing.
    This matters both for accessibility and for impressiveness to technical recruiters.

    (VERY LOW PRIORITY - DO NOT CONSIDER FOR REQS NOW)

    3. Dark/light mode toggle
    The site is locked to dark. 
    A toggle (persisted to localStorage) is a small touch that signals attention to UX detail.
    Dark/light mode toggle The site is locked to dark.

    A toggle (persisted to localStorage) is a small touch that signals attention to UX detail.

    (VERY LOW PRIORITY - DO NOT CONSIDER FOR REQS NOW)

    4. Section-level loading states / error boundaries

    Islands currently show a skeleton or nothing on error. A proper error boundary with a retry button would be more resilient.

    (HIGH PRIORITY FIX)

    5. Sitemap + robots.txt
    Astro has a @astrojs/sitemap integration. Without it, search engines won't index the portfolio well. The phylo-robots.txt file exists but isn't wired up. This also has to be done in juntion with the footer as well. I have 3D elements in both hero and article sections, what else could I do interactively to show an green-evolution-friendly coding enthusiasm using a web feature. I could learn something from this.

    (HIGH PRIORITY FIX)

    6. Analytics (privacy-first)

    No analytics at all. Something like Plausible or Umami (self-hosted, GDPR-friendly) would give you data on which projects/sections get attention — useful for a portfolio.

    (PLEASE DO THIS MAJOR PRIORITY WITH GRAFANA/PROMETHEUS open-source tooling integrated.)

    7. Project detail page
    Right now projects are cards with hover overlays. There's no /projects/[slug] page for a full write-up with the image gallery, full description, and links. The slug field exists in the model but isn't used client-side. 
    
    <thought>
    Most of my projects have a /docs directory on github with either the README.md or project documentation file in the directory. If none, default to project root .md file. Summarise in apt form for user/potential recruiter summary.
    </thought>

    (HIGH-PRIORITY)

    8. Toast notifications in admin

    The admin currently uses alert() and confirm() for errors and confirmations. 
    These are jarring and break the UI aesthetic. A lightweight toast/notification system would be a clean improvement. 

    <thought>
    I agree, toastify cyber-themed inline with the site's theme works in this case. 
    </thought>

    9. MAJOR PRIORITY for traceablity and autonomy refactors/upgrade.

    Site-wide we need to ensure we can trace user interactions for all card interactions and click interactions ethically covertly. 

    The chatbot should also be a portfolio LLM helper for the admin in that it informs the admin about the effect of the potential changes made to the portfolio client-facing side. Can look at metrics for each card. Due to security-aware tenets, these extra functionalities have to be setup with an admin token and specially generated-LLM token for extra access using expirable admin token as input as well.