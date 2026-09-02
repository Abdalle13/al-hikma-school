// shared stock photography for the public marketing pages. hotlinked from
// unsplash with sizing params so we do not ship large binaries in the repo.
// every shot below is a building, an empty room or objects. no people.
const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const siteImages = {
  building: u("1562774053-701939374585", 1800),
  buildingModern: u("1592066575517-58df903152f2", 1400),
  classroom: u("1580582932707-520aed937b7b", 1300),
  library: u("1497633762265-9d179a990aa6", 1100),
  libraryShelves: u("1524995997946-a1c2e315a42f", 1300),
};

export default siteImages;
