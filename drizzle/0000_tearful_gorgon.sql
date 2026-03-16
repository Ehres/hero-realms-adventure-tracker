CREATE TABLE "adventures" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"hero_class" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"max_hp" integer NOT NULL,
	"battle_count" integer DEFAULT 0 NOT NULL,
	"ability_rank" integer DEFAULT 1 NOT NULL,
	"skill_rank" integer DEFAULT 1 NOT NULL,
	"health_upgrades" integer DEFAULT 0 NOT NULL,
	"inventory" text[] DEFAULT '{}' NOT NULL,
	"pending_level_up" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"adventure_id" text NOT NULL,
	"current_hp" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'setup' NOT NULL,
	"winner_adventure_id" text
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adventures" ADD CONSTRAINT "adventures_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_adventure_id_adventures_id_fk" FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adventures_profile_id_idx" ON "adventures" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "game_participants_game_id_idx" ON "game_participants" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_participants_adventure_id_idx" ON "game_participants" USING btree ("adventure_id");