// shared stock photography for the public marketing pages. hotlinked from
// unsplash with sizing params so we do not ship large binaries in the repo.
const u = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const siteImages = {
  classroom: u("1509062522246-3755977927d7"),
  pupilWriting: u("1580582932707-520aed937b7b"),
  studyGroup: u("1522202176988-66273c2fd55f"),
  lecture: u("1524178232363-1fb2b075b655", 1200),
  library: u("1497633762265-9d179a990aa6"),
  teacherBoard: u("1503676260728-1c00da094a0b", 1200),
};

export default siteImages;
