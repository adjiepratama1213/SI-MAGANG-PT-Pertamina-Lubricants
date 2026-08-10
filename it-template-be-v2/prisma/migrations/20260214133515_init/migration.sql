-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PTPL_IT', 'PTPL_QA', 'PTPL_PROD', 'VENDOR', 'GUEST', 'EMPLOYEE', 'SUPERSAIYAN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending', 'banned', 'rejected');

-- CreateEnum
CREATE TYPE "QrTokenStatus" AS ENUM ('PENDING', 'APPROVED', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "name" VARCHAR(255) NOT NULL,
    "jobTitle" TEXT,
    "photoUrl" TEXT,
    "idamanId" TEXT,
    "webAuthnId" VARCHAR(255) NOT NULL,
    "phone" TEXT,
    "encryptedSecret" TEXT,
    "hashBackupCode" TEXT,
    "positionId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrLoginToken" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "status" "QrTokenStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "QrLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "UserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "companyCode" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT,
    "organizationId" TEXT NOT NULL,
    "organizationParentId" TEXT,
    "isChief" BOOLEAN NOT NULL,
    "isHead" BOOLEAN NOT NULL,
    "isOwner" BOOLEAN NOT NULL,
    "isPublished" BOOLEAN NOT NULL,
    "isSync" BOOLEAN NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_webAuthnId_key" ON "User"("webAuthnId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_positionId_idx" ON "User"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "QrLoginToken_token_key" ON "QrLoginToken"("token");

-- CreateIndex
CREATE INDEX "QrLoginToken_token_idx" ON "QrLoginToken"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrLoginToken" ADD CONSTRAINT "QrLoginToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
