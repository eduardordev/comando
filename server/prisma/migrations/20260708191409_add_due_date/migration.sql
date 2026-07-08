-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "due_date" DATETIME;

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");
