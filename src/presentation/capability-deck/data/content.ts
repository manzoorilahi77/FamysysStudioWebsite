import type {
  DeckProject,
  PortfolioCategory,
} from '../types'

// All copy sourced directly from the approved Famysys Studio deck brief.
// Nothing here is invented — clients, stats, awards, and testimonials are
// intentionally absent because none were supplied.
const dineflowImg = "/capability-deck/portfolio/websites/dineflow.webp";
const skillhubImg = "/capability-deck/portfolio/websites/skillhub.webp";
const lenaDenaImg = "/capability-deck/portfolio/websites/lena-dena.png";
const kahFishImg = "/capability-deck/portfolio/websites/kah-fish.png";
const hajjUmrahImg = "/capability-deck/portfolio/websites/hajj-umrah.jpg";
const exclusiveBonusesPosterImg = "/capability-deck/portfolio/print-design/posters/exclusive-bonuses.jpg";
const stunningThumbnailsPosterImg = "/capability-deck/portfolio/print-design/posters/stunning-thumbnails.jpg";
const moreCollectionsPosterImg = "/capability-deck/portfolio/print-design/posters/more-collections-thumbnails.jpg";
const designYourWayPosterImg = "/capability-deck/portfolio/print-design/posters/design-your-way.jpg";
const templateShowcasePosterImg = "/capability-deck/portfolio/print-design/posters/template-showcase-grid.jpg";
const nicheTemplatePackPosterImg = "/capability-deck/portfolio/print-design/posters/niche-template-pack.jpg";
const transformAnythingPosterImg = "/capability-deck/portfolio/print-design/posters/transform-anything.jpg";
const thumbnailCollagePosterImg = "/capability-deck/portfolio/print-design/posters/thumbnail-collage.jpg";
const tenThousandTemplatesPosterImg = "/capability-deck/portfolio/print-design/posters/ten-thousand-templates.jpg";
const launchReadyDesignsPosterImg = "/capability-deck/portfolio/print-design/posters/launch-ready-designs.jpg";
const superMaxSanitizerPosterImg = "/capability-deck/portfolio/print-design/posters/super-max-sanitizer.jpg";
const megaBundleFlyersPosterImg = "/capability-deck/portfolio/print-design/posters/mega-bundle-flyers.jpg";
const whatsIncludedPosterImg = "/capability-deck/portfolio/print-design/posters/whats-included.jpg";
const dragDropPostPosterImg = "/capability-deck/portfolio/print-design/posters/drag-drop-post.jpg";
const templatesEveryNichePosterImg = "/capability-deck/portfolio/print-design/posters/templates-every-niche.jpg";
const resellersCreatorsPosterImg = "/capability-deck/portfolio/print-design/posters/resellers-creators.jpg";
const youtubeThumbnailsPackPosterImg = "/capability-deck/portfolio/print-design/posters/youtube-thumbnails-pack.jpg";
const tenKMegaBundlePosterImg = "/capability-deck/portfolio/print-design/posters/ten-k-mega-bundle.jpg";
const nicheCategoriesPosterImg = "/capability-deck/portfolio/print-design/posters/niche-categories.jpg";
const missheAwardShowPosterImg = "/capability-deck/portfolio/print-design/posters/misshe-award-show.jpg";
const openInCanvaPosterImg = "/capability-deck/portfolio/print-design/posters/open-in-canva.jpg";
const bonusAssetsIncludedPosterImg = "/capability-deck/portfolio/print-design/posters/bonus-assets-included.jpg";
const earbudsSmartTouchProductImg = "/capability-deck/portfolio/print-design/product-posters/earbuds-smart-touch.jpg";
const earbudsChargingCaseProductImg = "/capability-deck/portfolio/print-design/product-posters/earbuds-charging-case.jpg";
const earbudsQuadMicProductImg = "/capability-deck/portfolio/print-design/product-posters/earbuds-quad-mic.jpg";
const nissanGtrProductImg = "/capability-deck/portfolio/print-design/product-posters/nissan-gtr-r35-render.jpg";
const earbudsProductHeroImg = "/capability-deck/portfolio/print-design/product-posters/earbuds-product-hero.jpg";
const earbuds50HrsProductImg = "/capability-deck/portfolio/print-design/product-posters/earbuds-50hrs-playtime.jpg";
const chennaiSheekMenuImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-menu.jpg";
const srFoodkraftPizzaImg = "/capability-deck/portfolio/print-design/banners/sr-foodkraft-pizza.jpg";
const chennaiSheekStallImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-stall.jpg";
const chennaiSheekGrandOpeningImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-grand-opening.jpg";
const chennaiSheekDeliveryImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-delivery.jpg";
const srFoodkraftMenuBoardImg = "/capability-deck/portfolio/print-design/banners/sr-foodkraft-menu-board.jpg";
const chennaiSheekFullMenuImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-full-menu.jpg";
const chennaiSheekPriceMenuImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-price-menu.jpg";
const srFoodkraftStallImg = "/capability-deck/portfolio/print-design/banners/sr-foodkraft-stall.jpg";
const chennaiSheekBestsellersImg = "/capability-deck/portfolio/print-design/banners/chennai-sheek-king-bestsellers.jpg";

export const whoWeAre = {
  headline: 'Famysys is a founder-led technology partner.',
  copy: 'We help businesses build, automate and transform with practical, scalable digital solutions.',
  highlights: [
    {
      title: '30+ Years of Founder Experience',
      copy: 'Founder experience spanning IT services, product engineering, enterprise delivery and business leadership.',
    },
    {
      title: 'Outcome-Led Delivery',
      copy: 'Senior teams align technology to business priorities—and stay accountable for measurable progress.',
    },
  ],
  established: '2022',
  locations: 'USA · India',
  visionMission: [
    {
      title: 'Vision',
      copy: 'Professional creative production, without the agency overhead—accessible to every business, regardless of size.',
    },
    {
      title: 'Mission',
      copy: 'We combine human creativity with smart technology—design, video and AI-assisted production—to deliver professional, ready-to-use content.',
    },
  ],
}

export const processSteps = [
  {
    index: '01',
    title: 'Understand',
    copy: 'We understand your business, audience and objective.',
  },
  {
    index: '02',
    title: 'Create',
    copy: 'We develop the concept, script, design direction or production approach.',
  },
  {
    index: '03',
    title: 'Produce',
    copy: 'We combine creative expertise, modern tools and AI where it adds value.',
  },
  {
    index: '04',
    title: 'Refine',
    copy: 'We review, refine and incorporate feedback within the agreed scope.',
  },
  {
    index: '05',
    title: 'Deliver',
    copy: 'You receive polished, platform-ready creative assets.',
  },
]

export const engagementModels = [
  {
    tag: 'Launch',
    title: 'Essential Content',
    audience: 'For small businesses, local businesses, startups and growing brands.',
    examples: ['Social creatives', 'Short-form content', 'Promotional assets', 'Basic video production'],
  },
  {
    tag: 'Grow',
    title: 'Growth Content',
    audience: 'For businesses needing a consistent flow of creative content.',
    examples: ['Short-form video', 'UGC editing', 'AI-assisted video', 'Social creatives', 'Motion', 'Content adaptations'],
  },
  {
    tag: 'Scale',
    title: 'Advanced Creative',
    audience: 'For established businesses, B2B companies, product brands and marketing teams.',
    examples: ['Advanced video', 'Explainer videos', 'Training content', 'Motion graphics', 'Product visuals', 'Multi-format creative production'],
  },
  {
    tag: 'Creative Partnership',
    title: 'Your Flexible Creative Team',
    audience: 'For businesses requiring ongoing creative support across multiple formats.',
    examples: [],
  },
]

export const serviceCategories = [
  {
    title: 'Creative Design',
    tagline: 'Professional visuals for your business.',
    examples: ['Social media creatives', 'Banners', 'Posters', 'Catalogues', 'Marketing collateral', 'Presentations'],
  },
  {
    title: 'Video Production',
    tagline: 'Content designed to communicate and engage.',
    examples: ['Reels', 'Shorts', 'Promotional videos', 'Business videos', 'UGC editing', 'Content repurposing'],
  },
  {
    title: 'AI Video & Virtual Presenters',
    tagline: 'Create professional video content faster.',
    examples: ['AI videos', 'AI presenters', 'AI UGC', 'Product videos', 'Marketing content'],
  },
  {
    title: 'Explainer & Training',
    tagline: 'Make complex ideas easy to understand.',
    examples: ['Explainer videos', 'Training videos', 'Course content', 'Onboarding videos', 'Instructional content'],
  },
  {
    title: 'Motion & Visual Effects',
    tagline: 'Bring ideas to life through movement.',
    examples: ['Motion graphics', 'Animated typography', 'Visual effects', 'Compositing'],
  },
  {
    title: 'Product & Brand Visuals',
    tagline: 'Make products and brands look their best.',
    examples: ['Product visuals', 'Lifestyle visuals', 'Campaign visuals', 'Promotional assets'],
  },
]

// The Websites category uses the same coverflow gallery pattern as the
// video categories (see WebsiteGallery.jsx), just with project screenshots
// instead of embedded clips. `image` is intentionally absent on every
// entry until real thumbnail files are supplied — the card falls back to
// a plain placeholder rather than showing a fabricated screenshot.
export const websiteProjects: ReadonlyArray<DeckProject> = [
  {
    key: 'basha',
    title: 'Basha',
    category: 'Storefront & Kitchen Platform',
    summary: 'Storefront, admin panel and Android app on one API, one menu and one order record.',
    bullets: ['The menu, in the browser', 'A menu the owner controls', 'The same panel, on the floor'],
    url: 'https://famysys.com/portfolio/v2/restaurant-ordering-platform/',
    previewUrl: 'https://www.bashafood.in/',
  },
  {
    key: 'ferrobid',
    title: 'FerroBid',
    category: 'Industrial Auction Platform',
    summary: 'A metal e-auction: nine roles, earnest money per lot, and a close that extends itself.',
    bullets: ['Free to browse, registered to bid', 'Live bidding, on a clock that extends', 'Won lots run on to the gate pass'],
    url: 'https://famysys.com/portfolio/v2/metal-auction-marketplace/',
    previewUrl: 'https://ferrobid.aspirasys.in/#/home',
  },
  {
    key: 'dineflow',
    title: 'DineFlow',
    category: 'Order-to-Kitchen Platform',
    summary: 'Web, app and QR ordering, the counter, the kitchen pass, the rider and the branch report on one order record.',
    bullets: ['Three ways to order, chosen first', 'One counter, one queue, five states', 'Seven roles against seventeen modules'],
    url: 'https://famysys.com/portfolio/v2/dineflow-restaurant-os/',
    image: dineflowImg,
  },
  {
    key: 'royal-tiles',
    title: 'Royal Tiles',
    category: 'Tile Storefront & 3D Visualiser',
    summary: 'A showroom, a real-time 3D room that lays any tile on a floor or wall, and the console that stocks both.',
    bullets: ['It opens on a room, not a grid', 'Lay the tile down and walk around it', 'The console opens on stock'],
    url: 'https://famysys.com/portfolio/v2/stone-showroom-3d-visualiser/',
    previewUrl: 'https://royal.aspirasys.in/',
  },
  {
    key: 'miniminds-studio',
    title: 'MiniMinds Studio',
    category: "Children's Book Catalogue",
    summary: 'A storefront of 32 titles routed to Amazon and Flipkart, and the Studio that edits them and counts the redirects.',
    // Third bullet pending — user's source screenshot was illegible there.
    bullets: ['Thirty-two titles, filtered in place', 'A dashboard that counts clicks out, not views'],
    url: 'https://famysys.com/portfolio/v2/childrens-book-catalogue/',
    previewUrl: 'https://studiominiminds.com/',
  },
  {
    key: 'kkm-keychains',
    title: 'KKM Keychains',
    category: 'Bulk Keychains & Gifts',
    summary: 'A WordPress catalogue of 580-plus designs with no prices, and a quote path behind every one.',
    bullets: ['One catalogue, and no price on it', 'The page ends in a quote, not a checkout', 'Sized for corporate quantities'],
    url: 'https://famysys.com/portfolio/v2/bulk-gifting-catalogue/',
    previewUrl: 'https://kkmkeychains.in/',
  },
  {
    key: 'hajj-umrah',
    title: 'Hajj & Umrah',
    category: 'Travel Booking Platform',
    summary: 'A pilgrim’s path in four steps on the site, and the operator console that publishes it.',
    bullets: ['A journey broken into four steps', 'Departures by the Islamic calendar', 'One console behind all of it'],
    url: 'https://famysys.com/portfolio/v2/pilgrimage-booking-platform/',
    // Live preview blocked by the site (X-Frame-Options: SAMEORIGIN /
    // CSP frame-ancestors 'self'). Screenshot stays in the card; click
    // still opens the live site via liveUrl.
    image: hajjUmrahImg,
    liveUrl: 'https://moulana.aspirasys.in/',
  },
  {
    key: 'tnhss',
    title: 'TNHSS',
    category: 'Room & Hall Booking System',
    summary: "One inventory of 110 rooms behind a public site, a desk, a cleaner's board and a branch console.",
    bullets: ['Pick two dates, see what is free', 'Every room as a card, with its state', 'The cleaner sees the same board'],
    url: 'https://famysys.com/portfolio/v2/institutional-room-booking/',
    previewUrl: 'https://tnhajsociety.org/',
  },
  {
    key: 'bva-global',
    title: 'BVA Global',
    category: 'Corporate Site',
    summary: 'A corporate site built as one continuous page, from positioning to delivery method.',
    bullets: ['A claim, a promise, and the reason', 'Four services, one sentence each', 'The whole engagement, in one strip'],
    url: 'https://famysys.com/portfolio/v2/supply-chain-consultancy-site/',
    previewUrl: 'https://bvaglobal.ai/',
  },
  {
    key: 'kah-fish',
    title: 'KAH Fish',
    category: 'Wholesale Day-Book',
    summary: 'Purchases, sales and payments written once; balances current; an A5 bill from the entry itself.',
    bullets: ['The day opens on the position', 'The entry, printed as an A5 bill', 'Five roles, one grid'],
    url: 'https://famysys.com/portfolio/v2/wholesale-day-book/',
    image: kahFishImg,
  },
  {
    key: 'lena-dena',
    title: 'Lena Dena',
    category: 'Restaurant Bookkeeping System',
    summary: "A restaurant's books on one panel: takings, costs, a configured receipt and a trail of who entered what.",
    bullets: ['Open it at closing; the day is counted', 'Every cost carries a category and a state', 'Who did what, and when, on one page'],
    url: 'https://famysys.com/portfolio/v2/restaurant-books/',
    image: lenaDenaImg,
  },
  {
    key: 'skillhub',
    title: 'SkillHub',
    category: 'Course · Trainee Management',
    summary: 'Two role-based surfaces over one record, from enrolment to job-ready.',
    bullets: ['A journey with dates on it', 'The programme, at a glance', 'One account, one role, one surface'],
    url: 'https://famysys.com/portfolio/v2/trainee-management-portal/',
    image: skillhubImg,
  },
]

// Portfolio media. Video entries embed Google Drive files via the
// `/preview` player so they play in-frame without SharePoint sign-in.
// Digital Print & Design is static image work — see
// src/assets/portfolio/README.md.
export const portfolioCategories: ReadonlyArray<PortfolioCategory> = [
  {
    key: 'ugc',
    label: 'UGC edits',
    ratio: 'portrait',
    process: {
      input:
        'You share raw, unedited footage filmed on your end — clips, talking-head takes or product shots — plus the platform, tone and message you want the final UGC piece to land.',
      output:
        'We edit, caption and polish it into finished, platform-ready social content. Tools: Google Flow, Higgsfield — with GPT & Claude for script support, hooks and planning.',
    },
    videos: [
      {
        title: 'Before vs After - Ice Cream',
        src: 'https://drive.google.com/file/d/15h4Nx-oqZH0DS1aKpZPfDjhZ4xez5uL2/preview',
      },
      {
        title: 'GFT Before After',
        src: 'https://drive.google.com/file/d/1Pwnv1eG31ZCAKKa96PZQbUzARJJAuttd/preview',
      },
      {
        title: 'Before vs After - Imported',
        src: 'https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview',
      },
      {
        title: 'Before vs After - Burger Cafe',
        src: 'https://drive.google.com/file/d/11lP5-KN87haqGIYmdDLh7fLb4nz42O0z/preview',
      },
    ],
  },
  {
    key: 'motion-graphics',
    label: 'Motion graphics',
    ratio: 'landscape',
    process: {
      input:
        'You share the brief — script or talking points, brand assets, source footage, presentation decks or training material — and the length, aspect ratio and platforms you need.',
      output:
        'We animate, edit and deliver polished, platform-ready motion graphics. Tools: After Effects, Premiere Pro, CapCut, Blender — with GPT & Claude for script writing and planning.',
    },
    videos: [
      {
        title: 'INTRODUCING NI DIGITAL ORG',
        src: 'https://drive.google.com/file/d/1wakhhx4FO4nHQx9cawsHpS4FN5EABhvP/preview',
      },
      {
        title: 'AspiraSys Introduction',
        src: 'https://drive.google.com/file/d/1oRYmOchAM-7GQJfF-pAV9PJm9-NID1Nt/preview',
      },
      {
        title: 'Unlock Your Dream IT Career',
        src: 'https://drive.google.com/file/d/1ScURiN-1hpoSMTgn0KHMf7IPC7y3Yz3B/preview',
      },
      {
        title: 'Sep - Invitation 2026',
        src: 'https://drive.google.com/file/d/1Emk9B0eTdI5rpn_WDRz3L44URoOgSAoe/preview',
      },
      {
        title: 'Invitaion',
        src: 'https://drive.google.com/file/d/178oRW5bP7TvksehDtf6SkIVz-MNDn4Hz/preview',
      },
      {
        title: 'Wedding invitation',
        src: 'https://drive.google.com/file/d/1aITlvIN8ePl7i8xRYzzx4eoNYHT6Pe4Q/preview',
      },
    ],
  },
  {
    key: 'synthesia',
    label: 'Synthesia',
    ratio: 'landscape',
    process: {
      input:
        'Share a photo (or your preferred look), the script or talking points, and where the video will run — training, onboarding or marketing.',
      output:
        'We turn it into an avatar-based presenter video: your likeness as a digital avatar, speaking your message in a polished, ready-to-use cut. Tools: Synthesia — with GPT & Claude for scripts.',
    },
    videos: [
      {
        title: 'CPARS Million Dollar Wake Up',
        src: 'https://drive.google.com/file/d/1B6g7KnKRtYJP84-BXq2G_mQoH-h7nQM6/preview',
      },
      {
        title: 'Control Your CPARS to Win More Contracts',
        src: 'https://drive.google.com/file/d/1qXUtHdtX5h0RfcfPiQ7qUccUEwvRZK5j/preview',
      },
      {
        title: 'Define Epidemology',
        src: 'https://drive.google.com/file/d/16z1udmRORm3h-EcbBiP1dr3qE06hXHWf/preview',
      },
      {
        title: 'Mastering Risk and Odds Calculations in Epidemiological Studies',
        src: 'https://drive.google.com/file/d/1YyKrP2TuOKMZpyjP8FMK_6156sepXhEQ/preview',
      },
      {
        title: 'R&B Web Promo',
        src: 'https://drive.google.com/file/d/1-lkiXrKMIrVfziDMDH-gmLRD1i1ZJD8h/preview',
      },
      {
        title: 'The Future Of Software Development',
        src: 'https://drive.google.com/file/d/1t6V0rkdwu71JcDvBUJ7TFXL0TFLn7UZv/preview',
      },
      {
        title: 'The Significance of Risk & Odd in Epidemology',
        src: 'https://drive.google.com/file/d/12I5EJeiY15Ue1ANkUeN-FupDlqO-JgoZ/preview',
      },
      {
        title: 'Want a HIGH-PAYING Career Here’s the ONLY Formula That Works!',
        src: 'https://drive.google.com/file/d/1WEfvC38RD0xF6deV0zhXlPkUTXH5uaRK/preview',
      },
      {
        title: 'Want to Start a Career in IT but Don’t Know Where to Begin',
        src: 'https://drive.google.com/file/d/1IaTcG6K4Z3k2QehwFBZ8IxnpWV1lkcsO/preview',
      },
      {
        title: 'CIPL - Induction for New Joinee',
        src: 'https://drive.google.com/file/d/1MrliDwNmAk53Z35z-bM6P_xjulS0f6a5/preview',
      },
    ],
  },
  {
    key: 'ai-video',
    label: 'AI Video',
    ratio: 'portrait',
    process: {
      input:
        'You share the product, message or scenario — reference visuals, brand assets, voice preference and where the video will run (reels, ads, product pages).',
      output:
        'We generate and refine AI-assisted video into a polished, ready-to-use final cut. Tools: Flow, Higgsfield — with GPT & Claude for script writing and planning.',
    },
    videos: [
      {
        title: 'AI Video 01',
        src: 'https://drive.google.com/file/d/1d_8xWJjl2La3qVEayOPobRTwJn9wkoUw/preview',
      },
      {
        title: 'AI Video 02',
        src: 'https://drive.google.com/file/d/1onx8mIM44RqCSPTZoccPCRdE3K8HFZdS/preview',
      },
      {
        title: 'AI Video 03',
        src: 'https://drive.google.com/file/d/1hG1oF5SOVw1pL0P-Ex6Zt_nFNxzhYi43/preview',
      },
    ],
  },
  {
    key: 'print-design',
    label: 'Digital Print & Design',
    copy: 'Banners, catalogues and posters designed for business impact.',
    ratio: 'portrait',
    process: {
      input:
        'You share brand assets (logo, colours, fonts), the core message, sizes or placements needed, and any reference designs or campaign copy.',
      output:
        'We design print-ready and digital-ready banners, posters and product posters. Tools: Canva, Figma, Illustrator, Photoshop — with GPT & Claude for copy and planning support.',
    },
    subcategories: [
      {
        key: 'banners',
        label: 'Banners',
        ratio: 'portrait',
        images: [
          {
            key: 'chennai-sheek-king-menu',
            title: 'Chennai Sheek King Menu',
            image: chennaiSheekMenuImg,
          },
          {
            key: 'sr-foodkraft-pizza',
            title: 'SR Foodkraft Pizza',
            image: srFoodkraftPizzaImg,
          },
          {
            key: 'chennai-sheek-king-stall',
            title: 'Chennai Sheek King Stall',
            image: chennaiSheekStallImg,
          },
          {
            key: 'chennai-sheek-king-grand-opening',
            title: 'Chennai Sheek King Grand Opening',
            image: chennaiSheekGrandOpeningImg,
          },
          {
            key: 'chennai-sheek-king-delivery',
            title: 'Chennai Sheek King Delivery',
            image: chennaiSheekDeliveryImg,
          },
          {
            key: 'sr-foodkraft-menu-board',
            title: 'SR Foodkraft Menu Board',
            image: srFoodkraftMenuBoardImg,
          },
          {
            key: 'chennai-sheek-king-full-menu',
            title: 'Chennai Sheek King Full Menu',
            image: chennaiSheekFullMenuImg,
          },
          {
            key: 'chennai-sheek-king-price-menu',
            title: 'Chennai Sheek King Price Menu',
            image: chennaiSheekPriceMenuImg,
          },
          {
            key: 'sr-foodkraft-stall',
            title: 'SR Foodkraft Stall',
            image: srFoodkraftStallImg,
          },
          {
            key: 'chennai-sheek-king-bestsellers',
            title: 'Chennai Sheek King Bestsellers',
            image: chennaiSheekBestsellersImg,
          },
        ],
      },
      {
        key: 'posters',
        label: 'Posters',
        ratio: 'square',
        images: [
          {
            key: 'exclusive-bonuses',
            title: 'Exclusive Bonuses',
            image: exclusiveBonusesPosterImg,
          },
          {
            key: 'stunning-thumbnails',
            title: 'Stunning Thumbnails',
            image: stunningThumbnailsPosterImg,
          },
          {
            key: 'more-collections-thumbnails',
            title: 'More Collections — Thumbnails',
            image: moreCollectionsPosterImg,
            ratio: 'portrait',
          },
          {
            key: 'design-your-way',
            title: 'Design Your Way',
            image: designYourWayPosterImg,
          },
          {
            key: 'template-showcase-grid',
            title: 'Template Showcase',
            image: templateShowcasePosterImg,
          },
          {
            key: 'niche-template-pack',
            title: 'Niche Template Pack',
            image: nicheTemplatePackPosterImg,
          },
          {
            key: 'transform-anything',
            title: 'Transform Anything',
            image: transformAnythingPosterImg,
          },
          {
            key: 'thumbnail-collage',
            title: 'Thumbnail Collage',
            image: thumbnailCollagePosterImg,
          },
          {
            key: 'ten-thousand-templates',
            title: '10,000+ Templates',
            image: tenThousandTemplatesPosterImg,
          },
          {
            key: 'launch-ready-designs',
            title: 'Launch-Ready Designs',
            image: launchReadyDesignsPosterImg,
          },
          {
            key: 'super-max-sanitizer',
            title: 'Super Max Sanitizer Label',
            image: superMaxSanitizerPosterImg,
            ratio: 'landscape',
          },
          {
            key: 'mega-bundle-flyers',
            title: 'Mega Bundle Flyers',
            image: megaBundleFlyersPosterImg,
          },
          {
            key: 'whats-included',
            title: "What's Included",
            image: whatsIncludedPosterImg,
          },
          {
            key: 'drag-drop-post',
            title: 'Drag. Drop. Post.',
            image: dragDropPostPosterImg,
          },
          {
            key: 'templates-every-niche',
            title: 'Templates for Every Niche',
            image: templatesEveryNichePosterImg,
          },
          {
            key: 'resellers-creators',
            title: 'Designed for Resellers & Creators',
            image: resellersCreatorsPosterImg,
          },
          {
            key: 'youtube-thumbnails-pack',
            title: 'YouTube Thumbnails Pack',
            image: youtubeThumbnailsPackPosterImg,
          },
          {
            key: 'ten-k-mega-bundle',
            title: '10K Mega Bundle',
            image: tenKMegaBundlePosterImg,
          },
          {
            key: 'niche-categories',
            title: 'Templates for Every Niche',
            image: nicheCategoriesPosterImg,
          },
          {
            key: 'misshe-award-show',
            title: "Mis'She Award Show Season 2",
            image: missheAwardShowPosterImg,
            ratio: 'portrait',
          },
          {
            key: 'open-in-canva',
            title: 'Open in Canva or Photoshop',
            image: openInCanvaPosterImg,
          },
          {
            key: 'bonus-assets-included',
            title: 'Bonus Assets Included',
            image: bonusAssetsIncludedPosterImg,
          },
        ],
      },
      {
        key: 'product-posters',
        label: 'Product Posters',
        ratio: 'square',
        images: [
          {
            key: 'earbuds-smart-touch',
            title: 'Earbuds — Smart Touch Control',
            image: earbudsSmartTouchProductImg,
          },
          {
            key: 'earbuds-charging-case',
            title: 'Earbuds — Charging Case',
            image: earbudsChargingCaseProductImg,
          },
          {
            key: 'earbuds-quad-mic',
            title: 'Earbuds — Quad Mic ENC',
            image: earbudsQuadMicProductImg,
          },
          {
            key: 'nissan-gtr-r35-render',
            title: 'Nissan GTR R35 — Blender Render',
            image: nissanGtrProductImg,
            ratio: 'portrait',
          },
          {
            key: 'earbuds-product-hero',
            title: 'Earbuds — Product Hero',
            image: earbudsProductHeroImg,
          },
          {
            key: 'earbuds-50hrs-playtime',
            title: 'Earbuds — Up to 50 Hrs Playtime',
            image: earbuds50HrsProductImg,
          },
        ],
      },
    ],
  },
  {
    key: 'websites',
    label: 'Websites',
    ratio: 'landscape',
    projects: websiteProjects,
  },
  {
    key: 'presentation',
    label: 'Presentation',
    ratio: 'landscape',
    title: 'Corporate Capability',
    category: 'Capability deck',
    summary: 'Live Famysys corporate capability presentation — positioning through selected work.',
    bullets: ['Interactive 12-slide deck', 'Click the preview to present', 'Open fullscreen when needed'],
    url: 'https://famysys.com/corporate/',
    embedUrl: 'https://famysys.com/corporate/',
  },
]

// Promoted out of CoverSlide.tsx's inline JSX literals so the cover has a real content
// home the same way every other slide does — see docs/capability-deck-port.md for why
// these two slides originally had none.
export const coverContent = {
  brand: 'Famysys Studio',
  headlineLine1: 'Where creativity',
  headlineLead: 'meets',
  headlineAccent: 'speed.',
  supporting: 'Design • Video • AI Content • Motion • Product Visuals',
  decorativeLabel: 'Corporate Deck',
  logoMark: '/capability-deck/famysys-logo.png',
}

// Promoted out of CTASlide.tsx's inline JSX literals — copy sourced from the live
// studio.famysys.com contact/CTA section, unchanged from what was already there.
export const ctaContent = {
  headline: 'Have a creative requirement? Let’s talk.',
  body: 'Tell us what you’re trying to create. We’ll help you determine the right approach, scope and production model.',
  ctaLabel: 'Start a Conversation',
  ctaHref: 'https://studio.famysys.com/',
  caption: 'Project-based when you need it. Ongoing when you need more.',
}
