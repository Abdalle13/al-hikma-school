// shared stock photography for the public marketing pages. hotlinked from
// unsplash with sizing params so we do not ship large binaries in the repo.
const u = (id, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const siteImages = {
  // school buildings and empty rooms, no people
  heroBuilding: u("1562774053-701939374585", 1800),
  building: u("1562774053-701939374585", 1200),
  classroom: u("1509062522246-3755977927d7", 1100),
  library: u("1497633762265-9d179a990aa6", 1100),
};

export default siteImages;
