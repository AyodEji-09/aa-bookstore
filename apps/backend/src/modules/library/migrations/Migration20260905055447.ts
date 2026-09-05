import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905055447 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "customer_library_item" ("id" text not null, "customer_id" text not null, "product_id" text not null, "variant_id" text not null, "format" text check ("format" in ('ebook', 'audiobook')) not null, "order_id" text not null, "progress" jsonb null, "media_key" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_library_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_library_item_customer_id" ON "customer_library_item" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_library_item_product_id" ON "customer_library_item" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_library_item_variant_id" ON "customer_library_item" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_library_item_order_id" ON "customer_library_item" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_library_item_deleted_at" ON "customer_library_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_library_item" cascade;`);
  }

}
