/* ============================================================
   videos.js — real videos, by topic. These are YouTube IDs found by
   title search; each card also links to the video page and to a
   YouTube search for the same topic, so a moved or removed video
   never leaves a dead end. Nothing plays until it is tapped.
   ============================================================ */
window.VIDEOS = {
  owls: [
    { id: 'I37rEh-SavY', title: 'Banding the Northern Saw-whet', q: 'northern saw-whet owl banding' },
    { id: 'r-u60PKsxG0', title: 'Saw-whet Owl Banding', q: 'saw-whet owl banding station night' },
    { id: 'B63Szw3MeIA', title: 'Northern Saw-whet Owl Banding, live from a field station', q: 'saw-whet owl banding live' },
    { id: 'JM3ssme1bEs', title: 'Bird Banding at SUNY Oswego (Rice Creek)', q: 'bird banding SUNY Oswego Rice Creek' },
    { id: 'lJL2V6Rrfh0', title: 'Tying a mist net (Long Point Bird Observatory)', q: 'mist net bird banding how to' },
    { id: 'wgyGFk8MTgA', title: 'Mist net: capture method for birds', q: 'mist net capture birds' }
  ],
  insects: [
    { id: 'mFjlY2rIrRY', title: 'How To Pin and Spread Insects', q: 'how to pin and spread insects' },
    { id: 'TAp1KQmPuWQ', title: 'How To Spread Your Butterflies (Lepidoptera)', q: 'how to spread butterfly specimen spreading board' },
    { id: 'IiNH73l2Rtg', title: 'How To Properly Pin Butterflies', q: 'how to pin butterflies' },
    { id: 'fO1u-wIaoO8', title: 'Pinning Butterflies and Moths (Oregon State Extension)', q: 'pinning butterflies moths extension' },
    { id: '_PsijbZNj14', title: 'How to Spread and Mount a Butterfly, Part 4 (Houston Museum of Natural Science)', q: 'HMNS spread mount butterfly' },
    { id: 'G0VI39diPZI', title: 'Inside the Insect Collection', q: 'inside museum insect collection' },
    { id: '-OSeqr0zIoY', title: 'Inside How We’re Digitizing 325,000 Insects (Smithsonian)', q: 'Smithsonian digitizing insects' },
    { id: '8UvjHYd31kY', title: 'The Bee Collection at the Smithsonian’s Natural History Museum', q: 'Smithsonian bee collection' },
    { id: 'Iu6OLgWBFhU', title: 'Inside the Insect Zoo with Dan Babbitt (Smithsonian)', q: 'Smithsonian insect zoo' }
  ],
  monarch: [
    { id: 'hrXzY4DP_c8', title: 'Inside the monarch butterfly migration mystery: flying to Mexico from Canada and the U.S.', q: 'monarch butterfly migration documentary' },
    { id: 'mXc1ZeRlOe0', title: 'The Story Behind Mexico’s Monarch Butterfly Migration', q: 'monarch migration Mexico sanctuary' },
    { id: 'arDRBGjrjKI', title: 'On Tiny Wings: The Monarch Migration', q: 'monarch migration film' },
    { id: '3njFNmc-W2k', title: 'The Great Monarch Migration', q: 'great monarch migration' },
    { id: 'IkPly79pT3g', title: 'Mesmerizing Footage of Monarch Butterflies Mating (Smithsonian Channel)', q: 'Smithsonian monarch butterflies Mexico' },
    { id: 'Y78ITSdL6i4', title: 'Efforts in Mexico to protect monarch butterflies’ winter grounds', q: 'monarch winter grounds protection Mexico' }
  ],
  roosevelt: [
    { id: 'F5Ft8634DbI', title: 'Theodore Roosevelt in Africa, 1909 (archive film)', q: 'Theodore Roosevelt in Africa 1909 film' },
    { id: 'MInMRIQpTAc', title: 'Teddy Roosevelt in Africa (1909)', q: 'Roosevelt African expedition Smithsonian' },
    { id: 'gtVqpw4oyy4', title: 'Teddy Roosevelt’s 1909 Kenyan Safari: archive film', q: 'Roosevelt Kenya safari 1909 archive' },
    { id: 'x629xmVZ4yM', title: 'Roosevelt’s Lost Expedition: Rediscovering the Secret Wildlife of Mt. Kenya', q: 'Roosevelt Mount Kenya expedition wildlife' },
    { id: 'KqSBoFXee2M', title: 'Why the Smithsonian Stores 148 Million Specimens', q: 'Smithsonian specimens collection behind the scenes' },
    { id: '0AJELLdEzL0', title: 'Smithsonian Mass Digitization: Department of Entomology', q: 'Smithsonian entomology digitization' }
  ],
  taxonomy: [
    { id: 'mv0OBOtzt8A', title: 'Carl Linnaeus’ Classification System', q: 'Linnaeus classification system explained' },
    { id: 'cVl2sS39eKQ', title: 'Carl Linnaeus: Father of Taxonomy', q: 'Carl Linnaeus father of taxonomy' },
    { id: 'akypCxlEn4k', title: 'Learn Biological Classification', q: 'biological classification kingdom phylum class order' }
  ],
  ricecreek: [
    { id: 'rxMUhzFTF7s', title: '2025 Experience Rice Creek: Current Discoveries, Research and Projects', q: 'Rice Creek Field Station Oswego' },
    { id: 'YVshX7nELT4', title: 'Student research: amphibian food supply at Rice Creek', q: 'Rice Creek student research amphibians' },
    { id: 'K4QdjphN5VA', title: 'Student research: viruses in amphibians at Rice Creek', q: 'Rice Creek ranavirus research' },
    { id: '1SX1ebISD3o', title: 'SUNY Oswego student research: isopods at Rice Creek', q: 'Rice Creek isopod research' },
    { id: 'JM3ssme1bEs', title: 'Bird Banding at SUNY Oswego', q: 'bird banding SUNY Oswego' }
  ]
};
