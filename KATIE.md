# Katie's Field Station

A zoology learning, exploration and travel app, built for Katie as she
chooses a college and a path with animals. It is a plain web app: no
account, no Claude, no app store. Open it in any browser.

**Open it:** `https://lemassif.github.io/bug-free-octo-succotash/zoology/`
(or tap **Katie's Field Station** on the arcade menu). On an iPhone or iPad,
open it in Safari, tap Share, then **Add to Home Screen** for an app icon.

## What is in it

| Section | What it does |
|---|---|
| **Taxonomy Lab** | Five lessons with quizzes (names, the seven ranks, trees not ladders, keying out an insect, why museums keep 148 million specimens). A **3D tree of life** built from the project's species, with a **deep-time slider** from 650 million years ago to today (the "4D" part): drag to spin, pinch to zoom, tap any node. A **drawer-sort** drag game. And the **classification project**. |
| **The classification project** | 164 real species in eight "expeditions" (Rice Creek Backyard, Owls of the Northeast, Insect Orders, The Monarch's World, Roosevelt's Africa, Vet School Rounds, Lake Ontario, Showstoppers). Each specimen is placed rank by rank — kingdom, phylum, class, order, family, genus, species — against plausible wrong answers drawn from real taxa. A correct run pins it into her **cabinet** with a museum-style locality label and determination label in her name. Progress, stars and badges persist, so it is a project for a season, not an afternoon. |
| **Insect Studio** | A touchable walk through curating an insect the way the Smithsonian does: relaxing chamber, **tap where the pin goes** (each order is different, and the studio explains a wrong tap), set the height on a pinning block, **spread a butterfly's wings** with sliders until the hind margin is square, pose legs for beetles and bugs, write the two labels, choose a Cornell drawer or a Riker mount. Plus the kit, specimens without killing, pests, and the ethics and the law (including the monarch's proposed ESA listing). |
| **Monarch** | Life cycle with **real photographs of each stage** pulled live from iNaturalist's life-stage annotations; an **animated month-by-month migration map** from Oswego to Michoacán and back over four generations; where the tag goes (tap the discal cell); mimics and cardenolides; how and where to help and see them. |
| **Roosevelt** | The boy with a museum in his bedroom, the timeline, the 1909–10 **Smithsonian–Roosevelt African Expedition on a month-by-month map**, the haul (about 11,400 specimens) and the people, the conservation legacy, and the argument about the hunting, told straight. |
| **Owls & Banding** | New York's eleven owls with photographs and links to their calls; how a saw-whet banding station runs hour by hour; a **UV feather-aging lab** (saw-whet feathers fluoresce pink; age the owl as HY, SY or ASY); a **pellet dissection tray** (drag bones, read the skull); and where to do it for real. |
| **Explore & Travel** | A map of 35 places: colleges, field stations, internships, week-long programs, vet and zoo opportunities, owl banding sites, monarch sites, museums, safaris and expeditions. Each says who it is for and when to act, with the organisation's own link. Katie saves places to **a plan** with a status, and a **year planner** shows which months matter. |
| **Colleges & Careers** | SUNY Oswego, SUNY ESF, Cornell and SUNY Cobleskill side by side; a **visit checklist** of twelve zoology-specific questions with her answers saved per college; the vet path in honest numbers; and careers that use zoology and theatre together. |
| **Field Journal** | Dated notes with place (optional GPS), weather, species seen (which build a life list), free text, a finger **sketch**, and a log of hours with animals (the thing vet schools ask for). Export as text. |

Daily touches: a **specimen of the day**, a day streak, badges, and a live
feed of research-grade iNaturalist observations within 25 km of Rice Creek
Field Station.

## Where the pictures and videos come from

- **Species photographs** are fetched live from the public
  [iNaturalist](https://www.inaturalist.org) API and, as a second source,
  Wikipedia page summaries. Every photo is a real photograph by a named
  person, credited on the card. They are cached in the browser for a month.
- **Videos** are YouTube videos found by title (banding nights, pinning and
  spreading tutorials, the monarch migration, the 1909 archive film of
  Roosevelt in Africa, Rice Creek's own student research). Nothing plays
  until tapped; each card also links to the video page and to a YouTube
  search for the topic, so a removed video is never a dead end.
- **Maps** use Leaflet and OpenStreetMap tiles.

So: photographs, maps and videos need a connection. Everything else — the
lessons, the project, the studio, the labs, the journal — works offline
once the app has been opened once (it ships its own service worker, like
Chance Academy).

## Where her progress lives

Everything lives in the browser that wrote it (`localStorage`); nothing is
sent anywhere. To keep it safe or move it to another phone or laptop, use
⚙︎ → **Export backup file**, then **Import backup** on the other device.
The settings also hold her name and the collector name that goes on
specimen labels.

## Things to check before planning around them

Dates, fees and eligibility in the Explore section are from the most recent
cycle found when the app was written (November 2026). Every card says so and
links to the source. Two that matter most for a senior who turns 18 this
year: the Smithsonian **NHRE** internship (students admitted to college but
not yet started are eligible; deadline has been mid-January) and the
**Student Conservation Association** national crews (ages 15–19, graduating
seniors included, free).

One correction to the family lore: Rice Creek's banding is **songbird**
banding (chickadees, sparrows, warblers; a cardinal colour-banding study).
The nearest **saw-whet owl** banding station is Braddock Bay Bird Observatory
in Hilton, near Rochester, about an hour and a half from Oswego, which runs
public owl-banding nights every fall. Both are on the map.

## Files

```
zoology/
  index.html            shell and script order
  app.css               shared styles (light and dark)
  manifest.webmanifest, icon-*.png, sw.js
  data/species.js       the 164 species, their classification and field notes
  data/places.js        the 35 places on the Explore map
  data/videos.js        the video lists
  js/store.js           persistence, export/import
  js/media.js           iNaturalist / Wikipedia / YouTube helpers, with caching
  js/app.js             routing, home, settings, badges
  js/taxonomy.js        lessons, project, drawer sort, cabinet, 3D tree page
  js/tree3d.js          the Three.js tree (uses ../three.module.min.js from the repo)
  js/insects.js, monarch.js, roosevelt.js, owls.js, explore.js, college.js, journal.js
```
