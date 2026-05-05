

export const initialFolders = [
  {
    id: "root",
    name: "My Files",
    parentId: null,
    createdAt: "2026-04-01T10:12:00Z",
  },
  {
    id: "f1",
    name: "Projects",
    parentId: "root",
    createdAt: "2026-04-03T09:00:00Z",
  },
  {
    id: "f2",
    name: "Images",
    parentId: "root",
    createdAt: "2026-04-05T15:22:00Z",
  },
  {
    id: "f3",
    name: "Videos",
    parentId: "root",
    createdAt: "2026-04-05T16:05:00Z",
  },
  {
    id: "f4",
    name: "Docs",
    parentId: "root",
    createdAt: "2026-04-06T08:30:00Z",
  },
  {
    id: "f5",
    name: "Design",
    parentId: "f1",
    createdAt: "2026-04-06T11:15:00Z",
  },
];

export const initialFiles = [
  {
    id: "file-1",
    name: "profile.png",
    type: "image/png",
    size: 2 * 1024 * 1024,
    folderId: "f2",
    url: "/assets/mock/profile.png",
    createdAt: "2026-04-06T10:22:00Z",
    updatedAt: "2026-04-12T09:10:00Z",
  },
  {
    id: "file-2",
    name: "Video1.mp4",
    type: "video/mp4",
    size: 18 * 1024 * 1024,
    folderId: "f3",
    url: "/assets/videos/Video1.mp4",
    createdAt: "2026-04-07T13:45:00Z",
    updatedAt: "2026-04-10T08:00:00Z",
  },
  {
  id: "file-3",
  name: "spring.pdf",
  type: "application/pdf",
  size: 850 * 1024,
  folderId: "f4",
  url: "/assets/pdf/spring.pdf",
   createdAt: "2026-04-08T07:18:00Z",
    updatedAt: "2026-04-14T18:34:00Z",
},
  {
    id: "file-4",
    name: "java.txt",
    type: "text/plain",
    size: 7 * 1024,
    folderId: "f1",
     url: "/assets/text/Java.txt",
     /*
    content:
      "FileOrbit mock notes.\n\n- Double-click a file to preview.\n- Use the ⋮ menu for actions.\n- Frontend-only mock system.",
      */
    createdAt: "2026-04-09T11:00:00Z",
    updatedAt: "2026-04-16T12:15:00Z",
  },
  {
    id: "file-5",
    name: "sets.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 220 * 1024,
    folderId: "f4",
    url: "/assets/docs/sets.docx",
    createdAt: "2026-04-10T09:05:00Z",
    updatedAt: "2026-04-10T09:05:00Z",
  },
  {
    id: "file-6",
    name: "image3.png",
    type: "image/png",
    size: 1.2 * 1024 * 1024,
    folderId: "f5",
    url: "/assets/mock/image3.png",
    createdAt: "2026-04-11T17:50:00Z",
    updatedAt: "2026-04-11T17:50:00Z",
  },
  {
    id: "file-7",
    name: "image1.png",
    type: "image/png",
    size: 2 * 1024 * 1024,
    folderId: "f2",
    url: "/assets/mock/image1.png",
    createdAt: "2026-04-06T10:22:00Z",
    updatedAt: "2026-04-12T09:10:00Z",
  },
  {
    id: "file-8",
    name: "image2.png",
    type: "image/png",
    size: 2 * 1024 * 1024,
    folderId: "f2",
    url: "/assets/mock/image2.png",
    createdAt: "2026-04-06T10:22:00Z",
    updatedAt: "2026-04-12T09:10:00Z",
  },
  {
    id: "file-9",
    name: "Ganesh.jpg",
    type: "image/jpg",
    size: 2 * 1024 * 1024,
    folderId: "f2",
    url: "/assets/mock/Ganesh.jpg",
    createdAt: "2026-04-06T10:22:00Z",
    updatedAt: "2026-04-12T09:10:00Z",
  },
  {
    id: "file-10",
    name: "image4.png",
    type: "image/png",
    size: 2 * 1024 * 1024,
    folderId: "f2",
    url: "/assets/mock/image4.png",
    createdAt: "2026-04-06T10:22:00Z",
    updatedAt: "2026-04-12T09:10:00Z",
  },
  
];

export const mockStorage = {
  capacityBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  usedBytes: 3.4 * 1024 * 1024 * 1024, // 3.4 GB (mock value)
};


