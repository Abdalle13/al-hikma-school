// shared stock photography for the public marketing pages. hotlinked from
// unsplash with sizing params so we do not ship large binaries in the repo.
// all interior shots are chosen to be empty rooms, no faces.
const u = (id, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const siteImages = {
  heroBuilding: u("1562774053-701939374585", 1800),
  classroom: u("1610484826967-09c5720778c7", 1100),
  classroomRows: u("1567168544813-cc03465b4fa8", 1100),
  library: u("1497633762265-9d179a990aa6", 1100),
};

export default siteImages;
