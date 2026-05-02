-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 2,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_bookingId_key" ON "Meeting"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_roomName_key" ON "Meeting"("roomName");

-- CreateIndex
CREATE INDEX "Meeting_roomName_idx" ON "Meeting"("roomName");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
