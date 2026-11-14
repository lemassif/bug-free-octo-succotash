/* ============================================================
   videos.js — real videos, by topic.

   Every ID here was checked against YouTube when the list was
   written. The app checks again each time a card is shown: it asks
   YouTube for the video's current title and channel, and quietly
   drops a card whose video has been removed or made private. Each
   card also carries a search link, and most sections add a live
   strip of open-licence film from Wikimedia Commons, so there is
   never a dead end. Nothing plays until it is tapped.
   ============================================================ */
window.VIDEOS = {
  owls: [
    { id: 'I37rEh-SavY', title: 'Banding the Northern Saw-whet', q: 'northern saw-whet owl banding' },
    { id: 'B63Szw3MeIA', title: 'Northern Saw-whet Owl Banding, live from a field station', q: 'saw-whet owl banding live' },
    { id: 'JM3ssme1bEs', title: 'Bird Banding at SUNY Oswego', q: 'bird banding SUNY Oswego Rice Creek' },
    { id: 'lJL2V6Rrfh0', title: 'Tying a Mist Net (Long Point Bird Observatory)', q: 'mist net bird banding how to' },
    { id: 'wgyGFk8MTgA', title: 'Mist net: capture method for birds', q: 'mist net capture birds' }
  ],
  insects: [
    { id: 'mFjlY2rIrRY', title: 'How To Pin and Spread Insects', q: 'how to pin and spread insects' },
    { id: 'TAp1KQmPuWQ', title: 'How To Spread Your Butterflies (Lepidoptera)', q: 'how to spread butterfly specimen spreading board' },
    { id: 'IiNH73l2Rtg', title: 'How To Properly Pin Butterflies', q: 'how to pin butterflies' },
    { id: 'fO1u-wIaoO8', title: 'Pinning Butterflies and Moths', q: 'pinning butterflies moths extension' },
    { id: '_PsijbZNj14', title: 'How to Spread and Mount a Butterfly, Part 4', q: 'HMNS spread mount butterfly' },
    { id: 'G0VI39diPZI', title: 'Inside the Insect Collection', q: 'inside museum insect collection' },
    { id: '-OSeqr0zIoY', title: 'Inside How We’re Digitizing 325,000 Insects', q: 'Smithsonian digitizing insects' },
    { id: '8UvjHYd31kY', title: 'The Bee Collection at the Smithsonian’s Natural History Museum', q: 'Smithsonian bee collection' },
    { id: 'Iu6OLgWBFhU', title: 'Inside the Insect Zoo with Dan Babbitt', q: 'Smithsonian insect zoo' }
  ],
  monarch: [
    { id: 'hrXzY4DP_c8', title: 'Inside the monarch butterfly migration mystery', q: 'monarch butterfly migration documentary' },
    { id: 'mXc1ZeRlOe0', title: 'The Story Behind Mexico’s Monarch Butterfly Migration', q: 'monarch migration Mexico sanctuary' },
    { id: 'arDRBGjrjKI', title: 'On Tiny Wings: The Monarch Migration', q: 'monarch migration film' },
    { id: '3njFNmc-W2k', title: 'The Great Monarch Migration', q: 'great monarch migration' },
    { id: 'IkPly79pT3g', title: 'Mesmerizing Footage of Monarch Butterflies Mating', q: 'Smithsonian monarch butterflies Mexico' },
    { id: 'Y78ITSdL6i4', title: 'Efforts in Mexico to protect monarch butterflies’ winter grounds', q: 'monarch winter grounds protection Mexico' }
  ],
  roosevelt: [
    { id: 'F5Ft8634DbI', title: 'Theodore Roosevelt in Africa, 1909', q: 'Theodore Roosevelt in Africa 1909 film' },
    { id: 'MInMRIQpTAc', title: 'Teddy Roosevelt in Africa (1909), silent', q: 'Roosevelt African expedition Smithsonian' },
    { id: 'gtVqpw4oyy4', title: 'Teddy Roosevelt’s 1909 Kenyan Safari: archive film', q: 'Roosevelt Kenya safari 1909 archive' },
    { id: 'x629xmVZ4yM', title: 'Roosevelt’s Lost Expedition: Rediscovering the Secret Wildlife of Mt. Kenya', q: 'Roosevelt Mount Kenya expedition wildlife' },
    { id: 'KqSBoFXee2M', title: 'Why the Smithsonian Stores 148 Million Specimens', q: 'Smithsonian specimens collection behind the scenes' },
    { id: '0AJELLdEzL0', title: 'Smithsonian Mass Digitization: Department of Entomology', q: 'Smithsonian entomology digitization' }
  ],
  taxonomy: [
    { id: 'F38BmgPcZ_I', title: 'Taxonomy: Life’s Filing System (Crash Course Biology)', q: 'taxonomy classification crash course' },
    { id: 'YM6Ekb5De2o', title: 'Phylogeny: How We’re All Related (Crash Course Biology)', q: 'phylogeny cladistics explained' },
    { id: 'cVl2sS39eKQ', title: 'Carl Linnaeus: Father of Taxonomy', q: 'Carl Linnaeus father of taxonomy' }
  ],
  ricecreek: [
    { id: 'rxMUhzFTF7s', title: '2025 Experience Rice Creek: Current Discoveries, Research and Projects', q: 'Rice Creek Field Station Oswego' },
    { id: 'YVshX7nELT4', title: 'Student research: amphibian food supply at Rice Creek', q: 'Rice Creek student research amphibians' },
    { id: 'K4QdjphN5VA', title: 'Student research: viruses in amphibians at Rice Creek', q: 'Rice Creek ranavirus research' },
    { id: '1SX1ebISD3o', title: 'SUNY Oswego student research: isopods at Rice Creek', q: 'Rice Creek isopod research' },
    { id: 'JM3ssme1bEs', title: 'Bird Banding at SUNY Oswego', q: 'bird banding SUNY Oswego' }
  ],
  /* real dissections to watch beside the 3D models, by specimen */
  dissect: {
    frog: [{ id: 'iDRzbRlUzDw', title: 'Frog Dissection: Internal Anatomy' }, { id: '9N27Tj3B4k8', title: 'Frog Dissection, Part 1 (college biology lab)' }],
    pig: [{ id: 'dC0yWBXaM28', title: 'How To Dissect A Fetal Pig (Carolina)' }, { id: '8RWsQvlT3bo', title: 'Fetal Pig Anatomy' }, { id: 'rG1FY25t9Vk', title: 'Fetal Pig Dissection, Part One' }],
    perch: [{ id: 'MUVgrpuExmY', title: 'Perch (Bony Fish) Dissection' }, { id: 'pNZQEmGp11k', title: 'Bony Fish (Perch) Anatomy' }, { id: 'r2u5roIr6x0', title: 'Perch Dissection (college biology lab)' }],
    worm: [{ id: '1tVVVu5vY6w', title: 'Worm Dissection' }, { id: 'aCnwF6vtE2g', title: 'Earthworm Dissection (college biology lab)' }],
    crayfish: [{ id: 's2p1KmqUlTY', title: 'Crayfish Dissection' }, { id: '-XOKPCGh17Y', title: 'Crayfish Dissection (college biology lab)' }],
    grasshopper: [{ id: 'iVnrh7bTHgk', title: 'External and internal anatomy of the lubber grasshopper' }],
    squid: [{ id: '5PPf1GARbXU', title: 'Squid Dissection: external and internal anatomy' }, { id: 'elw_Tcw0G0c', title: 'Virtual Squid Dissection' }],
    mussel: [{ id: 'WIzuSBKrtaY', title: 'Clam dissection: freshwater mussel' }, { id: 'C-3GqvLswc8', title: 'Bivalve Anatomy (freshwater mussel)' }],
    seastar: [{ id: '10QstwG1dQ4', title: 'Starfish (Sea Star) Dissection' }, { id: '_YCNlt8YXXE', title: 'Northern Sea Star Dissection and Anatomy Lesson' }],
    shark: [{ id: 'uJrT7lHg5Lw', title: 'Dogfish Shark Dissection (Carolina)' }, { id: '09cdeZn-0Qk', title: 'Dogfish Shark Dissection: Female Anatomy' }, { id: 'lqobGHqetqo', title: 'Dogfish Shark Dissection: Male Anatomy' }],
    pigeon: [{ id: 'qE1woas-SrA', title: 'Pigeon Dissection' }, { id: 'VUZoTJhNfdc', title: 'Internal Pigeon Anatomy' }],
    heart: [{ id: 'xDaR-j2pwuU', title: 'Sheep Heart Dissection (anatomy and physiology lab)' }, { id: 'UT_dBmO2cLM', title: 'Sheep Heart Dissection: Identifying the Major Structures' }],
    brain: [{ id: '-fDWH4_5DhI', title: 'Sheep Brain Dissection' }, { id: 'fvuUKYk0zJk', title: 'Sheep Brain Cranial Nerves' }],
    eye: [{ id: 'KJtrWzp2gFk', title: 'Cow Eye Dissection' }, { id: 'DlAxsdXJ5Bo', title: 'Cow Eyeball Dissection Tutorial with Anatomy and Physiology' }],
    kidney: [{ id: 'rgcfdRra198', title: 'Sheep Kidney Dissection (anatomy and physiology lab)' }]
  }
};
