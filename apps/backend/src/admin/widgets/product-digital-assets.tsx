import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Label,
  Hint,
  Drawer,
  StatusBadge,
  Table,
  Switch,
  toast,
} from "@medusajs/ui";
import { ArrowUpTray, Trash } from "@medusajs/icons";
import { useState, useEffect, useCallback, useMemo } from "react";

interface VariantData {
  id: string;
  title: string;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

const isDigitalVariant = (v: VariantData): boolean => {
  const meta = (v.metadata || {}) as Record<string, unknown>;
  if (meta.is_digital === true) return true;
  if (meta.format === "ebook" || meta.format === "audiobook") return true;
  if (meta.media_key || meta.file_url) return true;

  const title = (v.title || "").toLowerCase();
  const digitalTerms = [
    "ebook",
    "e-book",
    "audiobook",
    "audio book",
    "digital",
    "epub",
    "pdf",
    "audio",
  ];
  const physicalTerms = [
    "hardcover",
    "hard cover",
    "hard-cover",
    "paperback",
    "paper back",
    "paper-back",
    "softcover",
    "soft cover",
    "physical",
    "print",
  ];

  const hasDigitalTerm = digitalTerms.some((t) => title.includes(t));
  const hasPhysicalTerm = physicalTerms.some((t) => title.includes(t));

  if (hasDigitalTerm && !hasPhysicalTerm) return true;
  if (hasPhysicalTerm) return false;

  return false;
};

const ProductDigitalAssetsWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDigitalOnly, setShowDigitalOnly] = useState<boolean>(true);
  const [activeVariant, setActiveVariant] = useState<VariantData | null>(null);
  const [format, setFormat] = useState<"ebook" | "audiobook">("ebook");
  const [mediaKey, setMediaKey] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const visibleVariants = useMemo(() => {
    if (!showDigitalOnly) return variants;
    return variants.filter(isDigitalVariant);
  }, [variants, showDigitalOnly]);

  const digitalCount = useMemo(() => {
    return variants.filter(isDigitalVariant).length;
  }, [variants]);

  const fetchVariants = useCallback(async () => {
    if (!product?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/admin/products/${product.id}/digital-assets`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
      }
    } catch (err) {
      console.error("Failed to fetch product digital assets:", err);
    } finally {
      setLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const openDrawer = (variant: VariantData) => {
    const meta = (variant.metadata || {}) as Record<string, unknown>;
    const detectedFormat =
      (meta.format as "ebook" | "audiobook") ||
      (variant.title?.toLowerCase().includes("audio") ? "audiobook" : "ebook");

    setActiveVariant(variant);
    setFormat(detectedFormat);
    setMediaKey((meta.media_key as string) || (meta.file_url as string) || "");
    setSelectedFile(null);
  };

  const closeDrawer = () => {
    if (isUploading || isRemoving) return;
    setActiveVariant(null);
    setSelectedFile(null);
    setMediaKey("");
  };

  const handleSave = async () => {
    if (!activeVariant) return;
    setIsUploading(true);

    try {
      let finalKey = mediaKey.trim();

      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);

        const uploadRes = await fetch("/admin/uploads", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to Cloudflare storage");
        }

        const uploadData = await uploadRes.json();
        const uploaded = uploadData.files?.[0];
        if (uploaded) {
          finalKey = uploaded.url || uploaded.key || finalKey;
        }
      }

      if (!finalKey) {
        toast.error(
          "Please choose a file to upload or enter a Cloudflare R2 URL / key.",
        );
        setIsUploading(false);
        return;
      }

      const res = await fetch(`/admin/products/${product.id}/digital-assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          variant_id: activeVariant.id,
          format,
          media_key: finalKey,
          file_url: finalKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save digital asset metadata to variant");
      }

      toast.success(
        `Successfully linked ${format === "ebook" ? "eBook" : "Audiobook"} format to ${activeVariant.title}`,
      );

      await fetchVariants();
      closeDrawer();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "An error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!activeVariant) return;
    setIsRemoving(true);

    try {
      const res = await fetch(`/admin/products/${product.id}/digital-assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          variant_id: activeVariant.id,
          action: "remove",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove digital asset");
      }

      toast.success(`Removed digital asset from ${activeVariant.title}`);
      await fetchVariants();
      closeDrawer();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "An error occurred while removing.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-x-2">
            <Heading level="h2">Digital Products & Formats</Heading>
            {/* <Badge size="small" color="grey"> */}
            {/*   {digitalCount} {digitalCount === 1 ? "format" : "formats"} */}
            {/* </Badge> */}
          </div>
          {/* <Text className="text-ui-fg-subtle text-small"> */}
          {/*   Upload eBook (EPUB, PDF) and Audiobook (MP3, M4B) files to */}
          {/*   Cloudflare R2 or attach external streaming keys. */}
          {/* </Text> */}
        </div>
        <div className="flex items-center gap-x-2">
          <Label
            htmlFor="digital-filter-toggle"
            className="text-xs text-ui-fg-subtle cursor-pointer select-none"
          >
            Digital formats only
          </Label>
          <Switch
            id="digital-filter-toggle"
            checked={showDigitalOnly}
            onCheckedChange={setShowDigitalOnly}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-ui-fg-muted text-small">
          Loading digital formats...
        </div>
      ) : visibleVariants.length === 0 ? (
        <div className="p-6 text-center text-ui-fg-muted text-small">
          {showDigitalOnly
            ? 'No digital variants (eBook or Audiobook) detected for this title. Turn off "Digital formats only" above to view all variants.'
            : "No variants found for this title. Please create variants first in the Product Variants section."}
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Variant</Table.HeaderCell>
              <Table.HeaderCell>Digital Format</Table.HeaderCell>
              <Table.HeaderCell>Cloudflare File / Key</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visibleVariants.map((v) => {
              const meta = (v.metadata || {}) as Record<string, unknown>;
              const vFormat =
                (meta.format as string) ||
                (v.title?.toLowerCase().includes("ebook")
                  ? "ebook"
                  : v.title?.toLowerCase().includes("audio")
                    ? "audiobook"
                    : null);
              const vKey =
                (meta.media_key as string) || (meta.file_url as string) || "";

              return (
                <Table.Row key={v.id}>
                  <Table.Cell className="font-medium text-ui-fg-base">
                    {v.title}
                  </Table.Cell>
                  <Table.Cell>
                    {vFormat === "ebook" ? (
                      <StatusBadge color="green">eBook</StatusBadge>
                    ) : vFormat === "audiobook" ? (
                      <StatusBadge color="blue">Audiobook</StatusBadge>
                    ) : (
                      <StatusBadge color="grey">Physical / None</StatusBadge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {vKey ? (
                      <Badge
                        size="small"
                        color="grey"
                        className="font-mono max-w-[280px] truncate"
                        title={vKey}
                      >
                        {vKey}
                      </Badge>
                    ) : (
                      <Text className="text-ui-fg-muted text-xs">
                        No file uploaded
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => openDrawer(v)}
                    >
                      <ArrowUpTray className="w-3.5 h-3.5 mr-1" />
                      {vKey ? "Configure / Replace" : "Upload File"}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}

      <Drawer
        open={Boolean(activeVariant)}
        onOpenChange={(open) => !open && closeDrawer()}
      >
        <Drawer.Content className="max-w-lg flex flex-col">
          <Drawer.Header>
            <Drawer.Title className="font-bold">
              Configure Digital Asset
            </Drawer.Title>
            <Drawer.Description>
              Upload or update the digital format file for variants
            </Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="space-y-6 py-6 overflow-y-auto min-h-0 flex-1">
            <div className="space-y-2">
              <Label className="text-ui-fg-base text-small font-medium">
                Digital Format Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setFormat("ebook")}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    format === "ebook"
                      ? "border-ui-border-interactive bg-ui-bg-subtle ring-1 ring-ui-border-interactive"
                      : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong"
                  }`}
                >
                  <Text className="font-semibold text-small">eBook</Text>
                  <Text className="text-ui-fg-subtle text-xs">
                    EPUB, PDF, MOBI
                  </Text>
                </div>
                <div
                  onClick={() => setFormat("audiobook")}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    format === "audiobook"
                      ? "border-ui-border-interactive bg-ui-bg-subtle ring-1 ring-ui-border-interactive"
                      : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong"
                  }`}
                >
                  <Text className="font-semibold text-small">Audiobook</Text>
                  <Text className="text-ui-fg-subtle text-xs">
                    MP3, M4B, AAC, ZIP
                  </Text>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-ui-fg-base text-small font-medium">
                Upload File from Computer (Streams directly to Cloudflare R2)
              </Label>
              <div className="border border-dashed border-ui-border-strong rounded-xl p-6 text-center bg-ui-bg-subtle/50 hover:bg-ui-bg-subtle transition-colors">
                <input
                  type="file"
                  id="admin-digital-file-input"
                  accept={
                    format === "ebook"
                      ? ".epub,.pdf,.mobi"
                      : ".mp3,.m4a,.m4b,.aac,.zip,.wav"
                  }
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="admin-digital-file-input"
                  className="cursor-pointer block"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center text-ui-fg-subtle">
                    <ArrowUpTray className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <Text className="font-medium text-ui-fg-base text-small">
                        {selectedFile.name}
                      </Text>
                      <Text className="text-ui-fg-muted text-xs">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •
                        Click to change file
                      </Text>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Text className="font-medium text-ui-fg-interactive text-small">
                        Click here to select a file
                      </Text>
                      <Text className="text-ui-fg-subtle text-xs">
                        {format === "ebook"
                          ? "Supports EPUB, PDF, MOBI"
                          : "Supports MP3, M4B, AAC, ZIP"}
                      </Text>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-ui-fg-base text-small font-medium">
                Or Enter Existing Cloudflare R2 URL / Key
              </Label>
              <Input
                placeholder="e.g. https://... or r2-audiobooks/chapter1.mp3"
                value={mediaKey}
                onChange={(e) => setMediaKey(e.target.value)}
              />
              <Hint>
                If the file was already uploaded to your Cloudflare R2 bucket,
                paste its key or URL directly.
              </Hint>
            </div>

            {activeVariant?.metadata &&
              ((activeVariant.metadata as Record<string, unknown>).media_key ||
                (activeVariant.metadata as Record<string, unknown>)
                  .file_url) && (
                <div className="p-3 bg-ui-bg-base rounded-lg border border-ui-border-base flex items-center justify-between">
                  <div className="truncate pr-2">
                    <Text className="text-xs text-ui-fg-subtle">
                      Currently Linked:
                    </Text>
                    <Text className="text-xs font-mono text-ui-fg-base truncate max-w-[260px]">
                      {String(
                        (activeVariant.metadata as Record<string, unknown>)
                          .media_key ||
                          (activeVariant.metadata as Record<string, unknown>)
                            .file_url,
                      )}
                    </Text>
                  </div>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={handleRemove}
                    isLoading={isRemoving}
                    disabled={isUploading}
                  >
                    <Trash className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
          </Drawer.Body>

          <Drawer.Footer className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button variant="secondary" disabled={isUploading || isRemoving}>
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isUploading}
              disabled={
                isUploading || isRemoving || (!selectedFile && !mediaKey)
              }
            >
              {selectedFile ? "Upload to Cloudflare & Save" : "Save Changes"}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductDigitalAssetsWidget;
