/* ============================================================
   species.js — the specimen catalogue for Katie's long-term
   classification project.

   Each row: [scientific name, common name, phylum, class, order,
              family, expedition set, field note]
   Kingdom is Animalia unless the row is an object with a kingdom.
   Genus is the first word of the scientific name.
   Photos are not stored here: they are fetched live from
   iNaturalist (and Wikipedia) by scientific name, so every
   picture is a real photograph with its photographer credited.
   ============================================================ */
window.SPECIES_SETS = [
  { id: 'ricecreek', name: 'Rice Creek Backyard', icon: '🌲', blurb: 'The animals Katie will meet on the trails and ponds of a central New York field station.' },
  { id: 'owls', name: 'Owls of the Northeast', icon: '🦉', blurb: 'Every owl a bander might pull from a net in New York, from the thumb-sized saw-whet to the snowy.' },
  { id: 'insects', name: 'Insect Orders', icon: '🪲', blurb: 'One or two ambassadors from each of the big insect orders. Learn these and you can place almost any bug you catch.' },
  { id: 'monarch', name: "The Monarch's World", icon: '🦋', blurb: 'The monarch, its milkweed, its mimics, its predators and its winter forest. Two kingdoms in one drawer.' },
  { id: 'africa', name: "Roosevelt's Africa", icon: '🦁', blurb: 'Species the 1909 Smithsonian–Roosevelt expedition brought home, and the ones Katie would see on a safari today.' },
  { id: 'vet', name: 'Vet School Rounds', icon: '🩺', blurb: 'The patients. Every veterinarian has to know where the dog, the horse and the bearded dragon sit on the tree.' },
  { id: 'lake', name: 'Lake Ontario & the Great Lakes', icon: '🐟', blurb: 'Oswego sits on the lake. Natives, invaders and the birds that fish it.' },
  { id: 'show', name: 'Showstoppers', icon: '🎭', blurb: "Nature's performers: dancers, mimics, costume-changers and the loudest voices on Earth. For the actor in the zoologist." }
];

window.SPECIES = [
  /* ---------------- Rice Creek Backyard ---------------- */
  ['Odocoileus virginianus','White-tailed deer','Chordata','Mammalia','Artiodactyla','Cervidae','ricecreek','Even-toed hoofed mammal. Look for the browse line on the station’s shrubs.'],
  ['Sciurus carolinensis','Eastern gray squirrel','Chordata','Mammalia','Rodentia','Sciuridae','ricecreek','Rodents never stop growing their incisors.'],
  ['Tamias striatus','Eastern chipmunk','Chordata','Mammalia','Rodentia','Sciuridae','ricecreek','Same family as the squirrel: Sciuridae.'],
  ['Castor canadensis','North American beaver','Chordata','Mammalia','Rodentia','Castoridae','ricecreek','The largest rodent in North America.'],
  ['Erethizon dorsatum','North American porcupine','Chordata','Mammalia','Rodentia','Erethizontidae','ricecreek','About 30,000 quills; the quills are modified hairs.'],
  ['Procyon lotor','Raccoon','Chordata','Mammalia','Carnivora','Procyonidae','ricecreek','Carnivora is an order, not a diet: raccoons eat nearly everything.'],
  ['Vulpes vulpes','Red fox','Chordata','Mammalia','Carnivora','Canidae','ricecreek','Dog family. The genus and species are the same word.'],
  ['Canis latrans','Coyote','Chordata','Mammalia','Carnivora','Canidae','ricecreek','Eastern coyotes carry some wolf and dog ancestry.'],
  ['Mephitis mephitis','Striped skunk','Chordata','Mammalia','Carnivora','Mephitidae','ricecreek','Skunks got their own family, Mephitidae, after DNA work split them from weasels.'],
  ['Didelphis virginiana','Virginia opossum','Chordata','Mammalia','Didelphimorphia','Didelphidae','ricecreek','The only marsupial north of Mexico.'],
  ['Sylvilagus floridanus','Eastern cottontail','Chordata','Mammalia','Lagomorpha','Leporidae','ricecreek','Not a rodent: lagomorphs have a second pair of tiny upper incisors.'],
  ['Myotis lucifugus','Little brown bat','Chordata','Mammalia','Chiroptera','Vespertilionidae','ricecreek','Chiroptera means “hand-wing”.'],
  ['Cardinalis cardinalis','Northern cardinal','Chordata','Aves','Passeriformes','Cardinalidae','ricecreek','Rice Creek’s banded study species: colored leg bands let researchers follow individual pairs.'],
  ['Poecile atricapillus','Black-capped chickadee','Chordata','Aves','Passeriformes','Paridae','ricecreek','A frequent catch in a songbird mist net.'],
  ['Turdus migratorius','American robin','Chordata','Aves','Passeriformes','Turdidae','ricecreek','A thrush, in the same genus as the European blackbird.'],
  ['Buteo jamaicensis','Red-tailed hawk','Chordata','Aves','Accipitriformes','Accipitridae','ricecreek','The hawk whose scream is dubbed over every eagle in the movies.'],
  ['Haliaeetus leucocephalus','Bald eagle','Chordata','Aves','Accipitriformes','Accipitridae','ricecreek','Nests again along Lake Ontario after DDT nearly erased it.'],
  ['Ardea herodias','Great blue heron','Chordata','Aves','Pelecaniformes','Ardeidae','ricecreek','Herons were moved into Pelecaniformes by DNA studies.'],
  ['Megaceryle alcyon','Belted kingfisher','Chordata','Aves','Coraciiformes','Alcedinidae','ricecreek','The female is the more colorful sex, which is rare in birds.'],
  ['Dryocopus pileatus','Pileated woodpecker','Chordata','Aves','Piciformes','Picidae','ricecreek','Crow-sized; leaves rectangular holes in dead trees.'],
  ['Archilochus colubris','Ruby-throated hummingbird','Chordata','Aves','Apodiformes','Trochilidae','ricecreek','Shares an order with swifts.'],
  ['Meleagris gallopavo','Wild turkey','Chordata','Aves','Galliformes','Phasianidae','ricecreek','Galliformes: the chicken-like birds.'],
  ['Branta canadensis','Canada goose','Chordata','Aves','Anseriformes','Anatidae','ricecreek','Anseriformes: ducks, geese and swans.'],
  ['Gavia immer','Common loon','Chordata','Aves','Gaviiformes','Gaviidae','ricecreek','Solid bones help it dive; it needs a long runway to take off.'],
  ['Pseudacris crucifer','Spring peeper','Chordata','Amphibia','Anura','Hylidae','ricecreek','A tree frog the size of a thumbnail with a call you can hear a half-mile away.'],
  ['Lithobates sylvaticus','Wood frog','Chordata','Amphibia','Anura','Ranidae','ricecreek','Freezes solid in winter and thaws alive in spring.'],
  ['Notophthalmus viridescens','Eastern newt','Chordata','Amphibia','Urodela','Salamandridae','ricecreek','Its orange land-living stage is the “red eft”.'],
  ['Chrysemys picta','Painted turtle','Chordata','Reptilia','Testudines','Emydidae','ricecreek','Basks in rows on logs in Rice Creek’s pond.'],
  ['Chelydra serpentina','Snapping turtle','Chordata','Reptilia','Testudines','Chelydridae','ricecreek','Can live more than 40 years. Do not pick it up by the tail.'],
  ['Thamnophis sirtalis','Common garter snake','Chordata','Reptilia','Squamata','Colubridae','ricecreek','Squamata: scaled reptiles, lizards and snakes together.'],
  ['Salvelinus fontinalis','Brook trout','Chordata','Actinopterygii','Salmoniformes','Salmonidae','ricecreek','New York’s state fish. A char, not a true trout.'],
  ['Lepomis macrochirus','Bluegill','Chordata','Actinopterygii','Perciformes','Centrarchidae','ricecreek','A sunfish. Males guard the nest.'],

  /* ---------------- Owls of the Northeast ---------------- */
  ['Aegolius acadicus','Northern saw-whet owl','Chordata','Aves','Strigiformes','Strigidae','owls','Katie’s owl. Migrates at night in October–November; banders lure it with its own “toot” call.'],
  ['Aegolius funereus','Boreal owl','Chordata','Aves','Strigiformes','Strigidae','owls','Same genus as the saw-whet; a rare winter visitor to New York.'],
  ['Bubo virginianus','Great horned owl','Chordata','Aves','Strigiformes','Strigidae','owls','Nests in January in New York. Eats skunks.'],
  ['Bubo scandiacus','Snowy owl','Chordata','Aves','Strigiformes','Strigidae','owls','Same genus as the great horned owl. Shows up on Lake Ontario’s shore in irruption winters.'],
  ['Strix varia','Barred owl','Chordata','Aves','Strigiformes','Strigidae','owls','“Who cooks for you?” Dark eyes, no ear tufts.'],
  ['Strix nebulosa','Great gray owl','Chordata','Aves','Strigiformes','Strigidae','owls','Largest owl by length in North America, but mostly feathers.'],
  ['Megascops asio','Eastern screech-owl','Chordata','Aves','Strigiformes','Strigidae','owls','Comes in gray and red color morphs.'],
  ['Asio flammeus','Short-eared owl','Chordata','Aves','Strigiformes','Strigidae','owls','Hunts grasslands at dusk; New York lists it as endangered.'],
  ['Asio otus','Long-eared owl','Chordata','Aves','Strigiformes','Strigidae','owls','Roosts in groups in dense conifers in winter.'],
  ['Surnia ulula','Northern hawk owl','Chordata','Aves','Strigiformes','Strigidae','owls','Hunts by day and perches like a hawk.'],
  ['Tyto alba','Barn owl','Chordata','Aves','Strigiformes','Tytonidae','owls','The one northeastern owl in a different family: Tytonidae, the heart-faced owls.'],

  /* ---------------- Insect Orders ---------------- */
  ['Danaus plexippus','Monarch','Arthropoda','Insecta','Lepidoptera','Nymphalidae','insects','Lepidoptera: “scale wings”. Named by Linnaeus in 1758.'],
  ['Limenitis archippus','Viceroy','Arthropoda','Insecta','Lepidoptera','Nymphalidae','insects','The monarch’s look-alike. Find the black line across the hindwing.'],
  ['Papilio glaucus','Eastern tiger swallowtail','Arthropoda','Insecta','Lepidoptera','Papilionidae','insects','Papilio was Linnaeus’s original genus for every butterfly.'],
  ['Pieris rapae','Cabbage white','Arthropoda','Insecta','Lepidoptera','Pieridae','insects','Introduced from Europe; the first butterfly of spring.'],
  ['Nymphalis antiopa','Mourning cloak','Arthropoda','Insecta','Lepidoptera','Nymphalidae','insects','Overwinters as an adult, so it flies on the first warm March day.'],
  ['Actias luna','Luna moth','Arthropoda','Insecta','Lepidoptera','Saturniidae','insects','Giant silk moth. Adults have no mouthparts and live about a week.'],
  ['Hyalophora cecropia','Cecropia moth','Arthropoda','Insecta','Lepidoptera','Saturniidae','insects','North America’s largest native moth, wingspan to 18 cm.'],
  ['Hemaris thysbe','Hummingbird clearwing','Arthropoda','Insecta','Lepidoptera','Sphingidae','insects','A day-flying sphinx moth that hovers like a hummingbird.'],
  ['Coccinella septempunctata','Seven-spotted lady beetle','Arthropoda','Insecta','Coleoptera','Coccinellidae','insects','Coleoptera: “sheath wings”. The hardened forewings are elytra.'],
  ['Photinus pyralis','Common eastern firefly','Arthropoda','Insecta','Coleoptera','Lampyridae','insects','A beetle, not a fly. The J-shaped flash is the male’s signal.'],
  ['Popillia japonica','Japanese beetle','Arthropoda','Insecta','Coleoptera','Scarabaeidae','insects','Scarab. Arrived in New Jersey in 1916 in nursery stock.'],
  ['Neotibicen canicularis','Dog-day cicada','Arthropoda','Insecta','Hemiptera','Cicadidae','insects','Hemiptera: “half wings”. The late-summer buzz over Oswego.'],
  ['Oncopeltus fasciatus','Large milkweed bug','Arthropoda','Insecta','Hemiptera','Lygaeidae','insects','A true bug: piercing mouthparts, and wings half leathery, half membrane.'],
  ['Apis mellifera','Western honey bee','Arthropoda','Insecta','Hymenoptera','Apidae','insects','Hymenoptera: “membrane wings”. Veterinarians now treat bee colonies.'],
  ['Bombus impatiens','Common eastern bumble bee','Arthropoda','Insecta','Hymenoptera','Apidae','insects','Shares the family Apidae with the honey bee.'],
  ['Dolichovespula maculata','Bald-faced hornet','Arthropoda','Insecta','Hymenoptera','Vespidae','insects','Builds the gray paper football nests.'],
  ['Camponotus pennsylvanicus','Black carpenter ant','Arthropoda','Insecta','Hymenoptera','Formicidae','insects','Ants are wasps that lost their wings (except the queens and males).'],
  ['Anax junius','Common green darner','Arthropoda','Insecta','Odonata','Aeshnidae','insects','Odonata: “toothed ones”. Migrates like the monarch.'],
  ['Calopteryx maculata','Ebony jewelwing','Arthropoda','Insecta','Odonata','Calopterygidae','insects','A damselfly: wings held together over the back at rest.'],
  ['Mantis religiosa','European mantis','Arthropoda','Insecta','Mantodea','Mantidae','insects','Mantodea. The only insect that can turn its head to look over its shoulder.'],
  ['Diapheromera femorata','Northern walkingstick','Arthropoda','Insecta','Phasmatodea','Diapheromeridae','insects','Phasmatodea (also written Phasmida): the stick insects.'],
  ['Dissosteira carolina','Carolina grasshopper','Arthropoda','Insecta','Orthoptera','Acrididae','insects','Orthoptera: “straight wings”. Flashes black-and-cream hindwings when it jumps.'],
  ['Gryllus pennsylvanicus','Fall field cricket','Arthropoda','Insecta','Orthoptera','Gryllidae','insects','Count its chirps for 14 seconds and add 40: that is roughly the temperature in °F.'],
  ['Scudderia furcata','Fork-tailed bush katydid','Arthropoda','Insecta','Orthoptera','Tettigoniidae','insects','Long antennae separate katydids from grasshoppers.'],
  ['Musca domestica','House fly','Arthropoda','Insecta','Diptera','Muscidae','insects','Diptera: “two wings”. The hindwings are tiny balancing halteres.'],
  ['Culex pipiens','Common house mosquito','Arthropoda','Insecta','Diptera','Culicidae','insects','Also Diptera. Only the females bite.'],
  ['Chrysoperla carnea','Common green lacewing','Arthropoda','Insecta','Neuroptera','Chrysopidae','insects','Neuroptera: “nerve wings”. Larvae are aphid lions.'],
  ['Hexagenia limbata','Giant mayfly','Arthropoda','Insecta','Ephemeroptera','Ephemeridae','insects','Ephemeroptera: adults live a day. Hatches on Lake Erie show up on radar.'],
  ['Forficula auricularia','European earwig','Arthropoda','Insecta','Dermaptera','Forficulidae','insects','Dermaptera: “skin wings”, folded under short elytra.'],
  ['Corydalus cornutus','Eastern dobsonfly','Arthropoda','Insecta','Megaloptera','Corydalidae','insects','Its larva, the hellgrammite, is a bass-fishing bait.'],
  ['Lepisma saccharinum','Silverfish','Arthropoda','Insecta','Zygentoma','Lepismatidae','insects','Wingless and primitive; close to the first insects.'],

  /* ---------------- The Monarch's World ---------------- */
  { sci:'Asclepias syriaca', common:'Common milkweed', kingdom:'Plantae', phylum:'Tracheophyta', cls:'Magnoliopsida', order:'Gentianales', family:'Apocynaceae', set:'monarch', note:'Kingdom Plantae. The only food a monarch caterpillar will eat. Its cardenolides make the butterfly poisonous.' },
  { sci:'Asclepias tuberosa', common:'Butterfly milkweed', kingdom:'Plantae', phylum:'Tracheophyta', cls:'Magnoliopsida', order:'Gentianales', family:'Apocynaceae', set:'monarch', note:'Orange-flowered milkweed for a monarch garden.' },
  { sci:'Abies religiosa', common:'Oyamel fir', kingdom:'Plantae', phylum:'Tracheophyta', cls:'Pinopsida', order:'Pinales', family:'Pinaceae', set:'monarch', note:'The winter tree. Monarchs cluster on oyamel branches at 3,000 m in Michoacán.' },
  ['Danaus gilippus','Queen','Arthropoda','Insecta','Lepidoptera','Nymphalidae','monarch','The monarch’s southern cousin in the same genus.'],
  ['Euchaetes egle','Milkweed tussock moth','Arthropoda','Insecta','Lepidoptera','Erebidae','monarch','Another milkweed specialist; its hairy caterpillars feed in gangs.'],
  ['Tetraopes tetrophthalmus','Red milkweed beetle','Arthropoda','Insecta','Coleoptera','Cerambycidae','monarch','A longhorn beetle whose eyes are split in two by its antennae: “four-eyed”.'],
  ['Lespesia archippivora','Monarch tachinid fly','Arthropoda','Insecta','Diptera','Tachinidae','monarch','A parasitoid: its maggots grow inside monarch caterpillars.'],
  ['Icterus abeillei','Black-backed oriole','Chordata','Aves','Passeriformes','Icteridae','monarch','One of two Mexican birds that learned to eat monarchs by avoiding the toxic cuticle.'],
  ['Pheucticus melanocephalus','Black-headed grosbeak','Chordata','Aves','Passeriformes','Cardinalidae','monarch','The other monarch-eater in the oyamel forests; tolerates the poison.'],
  ['Peromyscus melanotis','Black-eared mouse','Chordata','Mammalia','Rodentia','Cricetidae','monarch','Scavenges fallen monarchs on the forest floor at the colonies.'],

  /* ---------------- Roosevelt's Africa ---------------- */
  ['Loxodonta africana','African savanna elephant','Chordata','Mammalia','Proboscidea','Elephantidae','africa','Carl Akeley joined the expedition to collect elephants for the Smithsonian and the AMNH.'],
  ['Panthera leo','Lion','Chordata','Mammalia','Carnivora','Felidae','africa','Roosevelt’s party took lions on the Kapiti Plains in the first weeks.'],
  ['Panthera pardus','Leopard','Chordata','Mammalia','Carnivora','Felidae','africa','Same genus as the lion, tiger and jaguar.'],
  ['Acinonyx jubatus','Cheetah','Chordata','Mammalia','Carnivora','Felidae','africa','Its own genus: it cannot fully retract its claws.'],
  ['Crocuta crocuta','Spotted hyena','Chordata','Mammalia','Carnivora','Hyaenidae','africa','Closer to cats than to dogs, despite the look.'],
  ['Lycaon pictus','African wild dog','Chordata','Mammalia','Carnivora','Canidae','africa','Endangered; hunts in packs with about an 80% success rate.'],
  ['Diceros bicornis','Black rhinoceros','Chordata','Mammalia','Perissodactyla','Rhinocerotidae','africa','Odd-toed: three toes per foot. Critically endangered today.'],
  ['Ceratotherium simum','White rhinoceros','Chordata','Mammalia','Perissodactyla','Rhinocerotidae','africa','Roosevelt’s party collected white rhinos on the Nile: a decision he himself questioned in print.'],
  ['Equus quagga','Plains zebra','Chordata','Mammalia','Perissodactyla','Equidae','africa','Same genus as the horse.'],
  ['Hippopotamus amphibius','Hippopotamus','Chordata','Mammalia','Artiodactyla','Hippopotamidae','africa','The closest living relatives of whales.'],
  ['Syncerus caffer','African buffalo','Chordata','Mammalia','Artiodactyla','Bovidae','africa','Bovidae: cattle, antelope, goats and sheep.'],
  ['Giraffa camelopardalis','Giraffe','Chordata','Mammalia','Artiodactyla','Giraffidae','africa','Seven neck vertebrae, same as you.'],
  ['Taurotragus oryx','Common eland','Chordata','Mammalia','Artiodactyla','Bovidae','africa','The largest antelope. Roosevelt collected elands for the museum groups.'],
  ['Tragelaphus eurycerus','Bongo','Chordata','Mammalia','Artiodactyla','Bovidae','africa','A forest antelope the expedition sought on Mount Kenya.'],
  ['Eudorcas thomsonii','Thomson’s gazelle','Chordata','Mammalia','Artiodactyla','Bovidae','africa','The “tommy”; the cheetah’s favorite prey.'],
  ['Phacochoerus africanus','Common warthog','Chordata','Mammalia','Artiodactyla','Suidae','africa','Pig family. Kneels on its wrists to graze.'],
  ['Hylochoerus meinertzhageni','Giant forest hog','Chordata','Mammalia','Artiodactyla','Suidae','africa','Discovered by science only in 1904, five years before the expedition.'],
  ['Papio anubis','Olive baboon','Chordata','Mammalia','Primates','Cercopithecidae','africa','Old World monkey family.'],
  ['Colobus guereza','Mantled guereza','Chordata','Mammalia','Primates','Cercopithecidae','africa','Black-and-white colobus; Roosevelt described hunting them in the Mount Kenya forest.'],
  ['Struthio camelus','Common ostrich','Chordata','Aves','Struthioniformes','Struthionidae','africa','Largest living bird; two toes per foot.'],
  ['Sagittarius serpentarius','Secretarybird','Chordata','Aves','Accipitriformes','Sagittariidae','africa','A raptor on stilts that stomps snakes.'],
  ['Ardeotis kori','Kori bustard','Chordata','Aves','Otidiformes','Otididae','africa','Among the heaviest flying birds.'],
  ['Leptoptilos crumenifer','Marabou stork','Chordata','Aves','Ciconiiformes','Ciconiidae','africa','Scavenges beside vultures.'],
  ['Balearica regulorum','Grey crowned crane','Chordata','Aves','Gruiformes','Gruidae','africa','Uganda’s national bird; the expedition passed through Uganda in 1909–10.'],
  ['Balaeniceps rex','Shoebill','Chordata','Aves','Pelecaniformes','Balaenicipitidae','africa','A Nile swamp bird the party saw on the way to Khartoum.'],
  ['Coracias caudatus','Lilac-breasted roller','Chordata','Aves','Coraciiformes','Coraciidae','africa','Same order as the belted kingfisher back home.'],
  ['Crocodylus niloticus','Nile crocodile','Chordata','Reptilia','Crocodilia','Crocodylidae','africa','Crocodilians are the closest living relatives of birds.'],
  ['Python sebae','Central African rock python','Chordata','Reptilia','Squamata','Pythonidae','africa','Africa’s largest snake.'],

  /* ---------------- Vet School Rounds ---------------- */
  ['Canis familiaris','Domestic dog','Chordata','Mammalia','Carnivora','Canidae','vet','Some authorities write Canis lupus familiaris: a subspecies of the wolf.'],
  ['Felis catus','Domestic cat','Chordata','Mammalia','Carnivora','Felidae','vet','Felidae, with the lion and leopard.'],
  ['Equus caballus','Horse','Chordata','Mammalia','Perissodactyla','Equidae','vet','Odd-toed: one toe per foot.'],
  ['Bos taurus','Cattle','Chordata','Mammalia','Artiodactyla','Bovidae','vet','Even-toed, with a four-chambered stomach.'],
  ['Ovis aries','Domestic sheep','Chordata','Mammalia','Artiodactyla','Bovidae','vet','Bovidae again.'],
  ['Capra hircus','Domestic goat','Chordata','Mammalia','Artiodactyla','Bovidae','vet','Rectangular pupils.'],
  ['Sus scrofa','Pig','Chordata','Mammalia','Artiodactyla','Suidae','vet','Same species as the wild boar.'],
  ['Vicugna pacos','Alpaca','Chordata','Mammalia','Artiodactyla','Camelidae','vet','Upstate New York has many alpaca farms; a large-animal vet will meet them.'],
  ['Gallus gallus','Chicken','Chordata','Aves','Galliformes','Phasianidae','vet','Descended from the red junglefowl of Southeast Asia.'],
  ['Melopsittacus undulatus','Budgerigar','Chordata','Aves','Psittaciformes','Psittaculidae','vet','A small Australian parrot: exotic-animal medicine.'],
  ['Oryctolagus cuniculus','European rabbit','Chordata','Mammalia','Lagomorpha','Leporidae','vet','All pet rabbit breeds are this one species.'],
  ['Cavia porcellus','Guinea pig','Chordata','Mammalia','Rodentia','Caviidae','vet','Cannot make its own vitamin C, like us.'],
  ['Mustela furo','Ferret','Chordata','Mammalia','Carnivora','Mustelidae','vet','Weasel family. Illegal to keep in New York City.'],
  ['Pogona vitticeps','Central bearded dragon','Chordata','Reptilia','Squamata','Agamidae','vet','Reptile medicine: temperature and UV light are half the diagnosis.'],
  ['Python regius','Ball python','Chordata','Reptilia','Squamata','Pythonidae','vet','Same family as the African rock python.'],
  ['Carassius auratus','Goldfish','Chordata','Actinopterygii','Cypriniformes','Cyprinidae','vet','Fish are patients too: aquatic veterinary medicine is a real specialty.'],

  /* ---------------- Lake Ontario & the Great Lakes ---------------- */
  ['Acipenser fulvescens','Lake sturgeon','Chordata','Actinopterygii','Acipenseriformes','Acipenseridae','lake','Can live 150 years. Being restored in Lake Ontario’s rivers.'],
  ['Oncorhynchus tshawytscha','Chinook salmon','Chordata','Actinopterygii','Salmoniformes','Salmonidae','lake','A Pacific salmon stocked in Lake Ontario; Oswego’s fall salmon run.'],
  ['Salvelinus namaycush','Lake trout','Chordata','Actinopterygii','Salmoniformes','Salmonidae','lake','Same genus as the brook trout.'],
  ['Sander vitreus','Walleye','Chordata','Actinopterygii','Perciformes','Percidae','lake','Perch family. Its reflective eyes let it hunt at dusk.'],
  ['Esox lucius','Northern pike','Chordata','Actinopterygii','Esociformes','Esocidae','lake','Ambush predator of the weed beds.'],
  ['Neogobius melanostomus','Round goby','Chordata','Actinopterygii','Gobiiformes','Gobiidae','lake','Invasive, arrived in ship ballast water in 1990.'],
  { sci:'Dreissena polymorpha', common:'Zebra mussel', kingdom:'Animalia', phylum:'Mollusca', cls:'Bivalvia', order:'Myida', family:'Dreissenidae', set:'lake', note:'Phylum Mollusca. Filtered the Great Lakes clear and changed the whole food web.' },
  { sci:'Faxonius rusticus', common:'Rusty crayfish', kingdom:'Animalia', phylum:'Arthropoda', cls:'Malacostraca', order:'Decapoda', family:'Cambaridae', set:'lake', note:'An arthropod that is not an insect: Malacostraca, with the crabs and lobsters.' },
  ['Necturus maculosus','Mudpuppy','Chordata','Amphibia','Urodela','Proteidae','lake','A salamander that keeps its external gills for life.'],
  ['Nannopterum auritum','Double-crested cormorant','Chordata','Aves','Suliformes','Phalacrocoracidae','lake','Formerly Phalacrocorax auritus: names change when genera are split.'],
  ['Larus delawarensis','Ring-billed gull','Chordata','Aves','Charadriiformes','Laridae','lake','The parking-lot gull. Charadriiformes includes gulls, terns and shorebirds.'],
  ['Sterna hirundo','Common tern','Chordata','Aves','Charadriiformes','Laridae','lake','Threatened in New York; nests on Oswego Harbor’s breakwaters.'],
  ['Charadrius melodus','Piping plover','Chordata','Aves','Charadriiformes','Charadriidae','lake','Endangered on the Great Lakes; a few pairs nest on Lake Ontario’s eastern shore.'],
  ['Pandion haliaetus','Osprey','Chordata','Aves','Accipitriformes','Pandionidae','lake','Its own family. Reversible outer toe for gripping fish.'],
  ['Neogale vison','American mink','Chordata','Mammalia','Carnivora','Mustelidae','lake','Formerly Neovison vison.'],
  ['Lontra canadensis','North American river otter','Chordata','Mammalia','Carnivora','Mustelidae','lake','Back in the Oswego River after reintroduction.'],

  /* ---------------- Showstoppers ---------------- */
  ['Pavo cristatus','Indian peafowl','Chordata','Aves','Galliformes','Phasianidae','show','The “peacock” is the male; the train is tail coverts, not the tail.'],
  ['Paradisaea raggiana','Raggiana bird-of-paradise','Chordata','Aves','Passeriformes','Paradisaeidae','show','A songbird, in the same order as the robin, with a courtship dance.'],
  ['Menura novaehollandiae','Superb lyrebird','Chordata','Aves','Passeriformes','Menuridae','show','The best mimic on Earth: chainsaws, camera shutters, other birds.'],
  ['Ceratopipra mentalis','Red-capped manakin','Chordata','Aves','Passeriformes','Pipridae','show','Moonwalks along a branch to court the female.'],
  ['Aptenodytes forsteri','Emperor penguin','Chordata','Aves','Sphenisciformes','Spheniscidae','show','Males incubate through the Antarctic winter.'],
  ['Phoenicopterus roseus','Greater flamingo','Chordata','Aves','Phoenicopteriformes','Phoenicopteridae','show','Pink from carotenoids in its food.'],
  { sci:'Maratus volans', common:'Peacock spider', kingdom:'Animalia', phylum:'Arthropoda', cls:'Arachnida', order:'Araneae', family:'Salticidae', set:'show', note:'Arachnida, not Insecta: eight legs, two body parts. A jumping spider that dances.' },
  { sci:'Thaumoctopus mimicus', common:'Mimic octopus', kingdom:'Animalia', phylum:'Mollusca', cls:'Cephalopoda', order:'Octopoda', family:'Octopodidae', set:'show', note:'Impersonates lionfish, sea snakes and flatfish. Phylum Mollusca.' },
  ['Ambystoma mexicanum','Axolotl','Chordata','Amphibia','Urodela','Ambystomatidae','show','Never grows up; regrows limbs. Critically endangered in the wild.'],
  ['Dendrobates tinctorius','Dyeing poison frog','Chordata','Amphibia','Anura','Dendrobatidae','show','Warning colors: aposematism, the same trick as the monarch.'],
  ['Furcifer pardalis','Panther chameleon','Chordata','Reptilia','Squamata','Chamaeleonidae','show','Changes color to signal mood, not to match the background.'],
  ['Varanus komodoensis','Komodo dragon','Chordata','Reptilia','Squamata','Varanidae','show','The largest lizard; venomous.'],
  ['Morpho peleides','Blue morpho','Arthropoda','Insecta','Lepidoptera','Nymphalidae','show','Its blue is structural: scales that bend light, not pigment.'],
  ['Attacus atlas','Atlas moth','Arthropoda','Insecta','Lepidoptera','Saturniidae','show','Wingtips mimic a cobra’s head.'],
  ['Dynastes hercules','Hercules beetle','Arthropoda','Insecta','Coleoptera','Scarabaeidae','show','Can reach 17 cm with the horn.'],
  ['Hymenopus coronatus','Orchid mantis','Arthropoda','Insecta','Mantodea','Hymenopodidae','show','A flower that eats pollinators.'],
  ['Megaptera novaeangliae','Humpback whale','Chordata','Mammalia','Artiodactyla','Balaenopteridae','show','Whales sit inside Artiodactyla, beside the hippo. Songs carry for miles.'],
  ['Enhydra lutris','Sea otter','Chordata','Mammalia','Carnivora','Mustelidae','show','Densest fur of any animal; uses rock tools.'],
  ['Ornithorhynchus anatinus','Platypus','Chordata','Mammalia','Monotremata','Ornithorhynchidae','show','An egg-laying mammal with a venomous spur.'],
  ['Osphranter rufus','Red kangaroo','Chordata','Mammalia','Diprotodontia','Macropodidae','show','Marsupial, like the opossum back at Rice Creek.']
];

/* Normalise rows into objects. */
window.SPECIES = window.SPECIES.map(function (r, i) {
  var o = Array.isArray(r)
    ? { sci: r[0], common: r[1], kingdom: 'Animalia', phylum: r[2], cls: r[3], order: r[4], family: r[5], set: r[6], note: r[7] }
    : r;
  o.id = o.sci.toLowerCase().replace(/[^a-z]+/g, '-');
  o.genus = o.sci.split(' ')[0];
  o.epithet = o.sci.split(' ')[1];
  o.index = i;
  return o;
});

/* Distractor pools: real taxa that are NOT the answer, so wrong
   choices are plausible rather than silly. */
window.TAXON_POOLS = {
  kingdom: ['Animalia', 'Plantae', 'Fungi', 'Protista', 'Bacteria', 'Archaea'],
  phylum: ['Chordata', 'Arthropoda', 'Mollusca', 'Annelida', 'Cnidaria', 'Echinodermata', 'Porifera', 'Platyhelminthes', 'Nematoda', 'Tracheophyta', 'Bryophyta', 'Basidiomycota'],
  cls: {
    Chordata: ['Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii', 'Chondrichthyes'],
    Arthropoda: ['Insecta', 'Arachnida', 'Malacostraca', 'Diplopoda', 'Chilopoda', 'Collembola'],
    Mollusca: ['Bivalvia', 'Cephalopoda', 'Gastropoda', 'Polyplacophora'],
    Tracheophyta: ['Magnoliopsida', 'Pinopsida', 'Liliopsida', 'Polypodiopsida']
  },
  order: {
    Mammalia: ['Artiodactyla', 'Perissodactyla', 'Carnivora', 'Rodentia', 'Lagomorpha', 'Chiroptera', 'Primates', 'Proboscidea', 'Didelphimorphia', 'Diprotodontia', 'Monotremata', 'Eulipotyphla', 'Sirenia'],
    Aves: ['Passeriformes', 'Strigiformes', 'Accipitriformes', 'Falconiformes', 'Anseriformes', 'Galliformes', 'Pelecaniformes', 'Coraciiformes', 'Piciformes', 'Apodiformes', 'Gaviiformes', 'Charadriiformes', 'Suliformes', 'Struthioniformes', 'Otidiformes', 'Ciconiiformes', 'Gruiformes', 'Psittaciformes', 'Sphenisciformes', 'Phoenicopteriformes', 'Columbiformes', 'Cuculiformes'],
    Reptilia: ['Testudines', 'Squamata', 'Crocodilia', 'Rhynchocephalia'],
    Amphibia: ['Anura', 'Urodela', 'Gymnophiona'],
    Actinopterygii: ['Salmoniformes', 'Perciformes', 'Cypriniformes', 'Acipenseriformes', 'Esociformes', 'Gobiiformes', 'Siluriformes', 'Anguilliformes'],
    Insecta: ['Lepidoptera', 'Coleoptera', 'Hymenoptera', 'Diptera', 'Hemiptera', 'Odonata', 'Orthoptera', 'Mantodea', 'Phasmatodea', 'Neuroptera', 'Ephemeroptera', 'Dermaptera', 'Megaloptera', 'Zygentoma', 'Blattodea', 'Trichoptera', 'Plecoptera'],
    Arachnida: ['Araneae', 'Scorpiones', 'Opiliones', 'Ixodida'],
    Malacostraca: ['Decapoda', 'Isopoda', 'Amphipoda'],
    Bivalvia: ['Myida', 'Unionida', 'Ostreida', 'Venerida'],
    Cephalopoda: ['Octopoda', 'Sepiida', 'Teuthida', 'Nautilida'],
    Magnoliopsida: ['Gentianales', 'Asterales', 'Rosales', 'Fabales', 'Lamiales'],
    Pinopsida: ['Pinales', 'Cupressales', 'Araucariales']
  }
};
