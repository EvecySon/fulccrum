-- CreateTable
CREATE TABLE "merchant_invites" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "invite_token" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_invites" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "invite_token" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cards" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "authorization_code" VARCHAR(255) NOT NULL,
    "card_type" VARCHAR(20) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "exp_month" VARCHAR(2) NOT NULL,
    "exp_year" VARCHAR(4) NOT NULL,
    "bank" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_invites_invite_token_key" ON "merchant_invites"("invite_token");

-- CreateIndex
CREATE INDEX "merchant_invites_invite_token_idx" ON "merchant_invites"("invite_token");

-- CreateIndex
CREATE INDEX "merchant_invites_email_idx" ON "merchant_invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "courier_invites_invite_token_key" ON "courier_invites"("invite_token");

-- CreateIndex
CREATE INDEX "courier_invites_invite_token_idx" ON "courier_invites"("invite_token");

-- CreateIndex
CREATE INDEX "courier_invites_email_idx" ON "courier_invites"("email");

-- CreateIndex
CREATE INDEX "saved_cards_user_id_idx" ON "saved_cards"("user_id");

-- CreateIndex
CREATE INDEX "saved_cards_user_id_is_default_idx" ON "saved_cards"("user_id", "is_default");

-- AddForeignKey
ALTER TABLE "saved_cards" ADD CONSTRAINT "saved_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
