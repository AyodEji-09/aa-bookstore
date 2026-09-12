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
  toast,
} from "@medusajs/ui";
import { BookOpen, PencilSquare, Plus, Trash } from "@medusajs/icons";
import { useState, useEffect, useMemo } from "react";

interface AttributeField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
}

interface CustomAttributeRow {
  id: string;
  key: string;
  value: string;
}

const BOOK_ATTRIBUTES: AttributeField[] = [
  {
    key: "author",
    label: "Author",
    placeholder: "e.g. Eric-Emmanuel Schmitt",
    hint: "Main writer or creator of the book",
  },
  {
    key: "publisher",
    label: "Publisher",
    placeholder: "e.g. Albin Michel",
    hint: "Publishing house or imprint",
  },
  {
    key: "publication_date",
    label: "Publication Date",
    placeholder: "e.g. October 12, 2023 or 2023-10-12",
    hint: "First release date or edition date",
  },
  {
    key: "language",
    label: "Language",
    placeholder: "e.g. English, French",
    hint: "Primary edition language",
  },
  {
    key: "isbn",
    label: "ISBN / EAN",
    placeholder: "e.g. 978-2226485901",
    hint: "International Standard Book Number",
  },
  {
    key: "print_length",
    label: "Print Length / Pages",
    placeholder: "e.g. 320 pages",
    hint: "Total page count for print editions",
  },
  {
    key: "reading_age",
    label: "Reading Age / Audience",
    placeholder: "e.g. 12+ years, Adults, Young Adult",
    hint: "Target readership group",
  },
  {
    key: "dimensions",
    label: "Book Dimensions",
    placeholder: "e.g. 14.5 x 2.2 x 21.5 cm",
    hint: "Physical size / trim specifications",
  },
];

const MEDIA_ATTRIBUTES: AttributeField[] = [
  {
    key: "narrator",
    label: "Audiobook Narrator",
    placeholder: "e.g. Full Cast Audio, Stephen Fry",
    hint: "Voice actor or reader for audiobooks",
  },
  {
    key: "duration",
    label: "Audiobook Duration",
    placeholder: "e.g. 8h 45m",
    hint: "Total listening runtime",
  },
];

const ALL_STANDARD_KEYS = new Set([
  ...BOOK_ATTRIBUTES.map((a) => a.key),
  ...MEDIA_ATTRIBUTES.map((a) => a.key),
]);

const IGNORED_METADATA_KEYS = new Set([
  "media_key",
  "file_url",
  "is_digital",
  "format",
]);

const ProductAttributesWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [metadata, setMetadata] = useState<Record<string, unknown>>(
    (product.metadata || {}) as Record<string, unknown>,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [customRows, setCustomRows] = useState<CustomAttributeRow[]>([]);

  useEffect(() => {
    const raw = (product.metadata || {}) as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v !== null && v !== undefined && String(v).trim() !== "") {
        cleaned[k] = v;
      }
    }
    setMetadata(cleaned);
  }, [product.metadata]);

  const configuredStandardCount = useMemo(() => {
    return [...BOOK_ATTRIBUTES, ...MEDIA_ATTRIBUTES].filter((attr) => {
      const val = metadata[attr.key];
      return val !== undefined && val !== null && String(val).trim() !== "";
    }).length;
  }, [metadata]);

  const hasAudioDetails = useMemo(() => {
    return MEDIA_ATTRIBUTES.some((attr) => {
      const val = metadata[attr.key];
      return val !== undefined && val !== null && String(val).trim() !== "";
    });
  }, [metadata]);

  const customMetadataEntries = useMemo(() => {
    return Object.entries(metadata).filter(
      ([key, val]) =>
        !ALL_STANDARD_KEYS.has(key) &&
        !IGNORED_METADATA_KEYS.has(key) &&
        val !== undefined &&
        val !== null &&
        String(val).trim() !== "",
    );
  }, [metadata]);

  const totalConfiguredCount =
    configuredStandardCount + customMetadataEntries.length;

  const openDrawer = () => {
    const nextFormState: Record<string, string> = {};
    for (const attr of [...BOOK_ATTRIBUTES, ...MEDIA_ATTRIBUTES]) {
      const val = metadata[attr.key];
      nextFormState[attr.key] =
        val !== undefined && val !== null ? String(val) : "";
    }
    setFormState(nextFormState);

    const nextCustomRows: CustomAttributeRow[] = customMetadataEntries.map(
      ([key, val]) => ({
        id: String(Date.now() + Math.random()),
        key,
        value: String(val),
      }),
    );
    setCustomRows(nextCustomRows);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentMeta: Record<string, unknown> = {
        ...(product.metadata || {}),
        ...metadata,
      };

      const nextMetadata: Record<string, unknown> = {
        ...currentMeta,
      };

      for (const attr of [...BOOK_ATTRIBUTES, ...MEDIA_ATTRIBUTES]) {
        const val = formState[attr.key]?.trim();
        if (val) {
          nextMetadata[attr.key] = val;
        } else {
          if (
            currentMeta[attr.key] !== undefined &&
            currentMeta[attr.key] !== null &&
            String(currentMeta[attr.key]).trim() !== ""
          ) {
            nextMetadata[attr.key] = null;
          } else {
            delete nextMetadata[attr.key];
          }
        }
      }

      const activeCustomKeys = new Set<string>();
      for (const row of customRows) {
        const rowKey = row.key.trim();
        const rowVal = row.value.trim();
        if (rowKey && rowVal) {
          activeCustomKeys.add(rowKey);
          nextMetadata[rowKey] = rowVal;
        }
      }

      for (const [key] of customMetadataEntries) {
        if (!activeCustomKeys.has(key)) {
          nextMetadata[key] = null;
        }
      }

      const res = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: nextMetadata,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save book attributes");
      }

      const data = await res.json();
      const updatedProduct = data.product || {};
      const returnedMetadata = (updatedProduct.metadata ||
        nextMetadata) as Record<string, unknown>;

      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(returnedMetadata)) {
        if (v !== null && v !== undefined && String(v).trim() !== "") {
          cleaned[k] = v;
        }
      }

      setMetadata(cleaned);
      toast.success("Book attributes updated successfully");
      setIsDrawerOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to save book attributes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2.5">
          <Heading level="h2">Book Attributes & Information</Heading>
        </div>
        <Button size="small" variant="secondary" onClick={openDrawer}>
          Edit
        </Button>
      </div>

      {/* Attributes Content */}
      {totalConfiguredCount === 0 ? (
        <div className="p-6 text-center text-ui-fg-muted text-small">
          No book attributes configured yet. Click &quot;Edit Attributes&quot;
          to add author, publisher, ISBN, and other specifications.
        </div>
      ) : (
        <div className="p-6 space-y-3">
          {/* Book Specifications */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BOOK_ATTRIBUTES.map((attr) => {
                const val = metadata[attr.key];
                const isSet =
                  val !== undefined &&
                  val !== null &&
                  String(val).trim() !== "";

                return (
                  <div
                    key={attr.key}
                    className="flex flex-col gap-y-1 p-3 rounded-md bg-ui-bg-subtle border border-ui-border-base"
                  >
                    <Text className="text-[11px] font-semibold text-ui-fg-subtle tracking-wider">
                      {attr.label}
                    </Text>
                    <Text
                      className={`text-xs font-medium break-words ${
                        isSet ? "text-ui-fg-base" : "text-ui-fg-muted italic"
                      }`}
                    >
                      {isSet ? String(val) : "Not set"}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio / Media Specifications */}
          {hasAudioDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MEDIA_ATTRIBUTES.map((attr) => {
                  const val = metadata[attr.key];
                  const isSet =
                    val !== undefined &&
                    val !== null &&
                    String(val).trim() !== "";

                  return (
                    <div
                      key={attr.key}
                      className="flex flex-col gap-y-1 p-3 rounded-md bg-ui-bg-subtle border border-ui-border-base"
                    >
                      <Text className="text-[11px] font-semibold text-ui-fg-subtle tracking-wider">
                        {attr.label}
                      </Text>
                      <Text
                        className={`text-xs font-medium break-words ${
                          isSet ? "text-ui-fg-base" : "text-ui-fg-muted italic"
                        }`}
                      >
                        {isSet ? String(val) : "Not set"}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Metadata Attributes */}
          {customMetadataEntries.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {customMetadataEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-y-1 p-3 rounded-md bg-ui-bg-subtle border border-ui-border-base"
                  >
                    <Text className="text-[11px] font-semibold text-ui-fg-subtle tracking-wider">
                      {key}
                    </Text>
                    <Text className="text-xs font-medium text-ui-fg-base break-words">
                      {String(val)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-w-xl flex flex-col">
          <Drawer.Header>
            <Drawer.Title className="font-bold">
              Edit Book Information
            </Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="space-y-6 py-6 overflow-y-auto min-h-0 flex-1">
            {/* Book Details */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm font-bold text-ui-fg-base">
                Book Details
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BOOK_ATTRIBUTES.map((attr) => (
                  <div key={attr.key} className="space-y-1.5">
                    <Label
                      htmlFor={`input-${attr.key}`}
                      className="text-xs font-medium text-ui-fg-base"
                    >
                      {attr.label}
                    </Label>
                    <Input
                      id={`input-${attr.key}`}
                      placeholder={attr.placeholder}
                      value={formState[attr.key] || ""}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [attr.key]: e.target.value,
                        }))
                      }
                    />
                    {attr.hint && (
                      <Hint className="text-[11px] text-ui-fg-subtle">
                        {attr.hint}
                      </Hint>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Audiobook / Media Details */}
            <div className="space-y-4 pt-4 border-t border-ui-border-base">
              <Heading level="h3" className="text-sm font-bold text-ui-fg-base">
                Audiobook & Media Details
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEDIA_ATTRIBUTES.map((attr) => (
                  <div key={attr.key} className="space-y-1.5">
                    <Label
                      htmlFor={`input-${attr.key}`}
                      className="text-xs font-medium text-ui-fg-base"
                    >
                      {attr.label}
                    </Label>
                    <Input
                      id={`input-${attr.key}`}
                      placeholder={attr.placeholder}
                      value={formState[attr.key] || ""}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [attr.key]: e.target.value,
                        }))
                      }
                    />
                    {attr.hint && (
                      <Hint className="text-[11px] text-ui-fg-subtle">
                        {attr.hint}
                      </Hint>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Attributes */}
            <div className="space-y-4 pt-4 border-t border-ui-border-base">
              <div className="flex items-center justify-between">
                <div>
                  <Heading
                    level="h3"
                    className="text-sm font-bold text-ui-fg-base"
                  >
                    Additional Custom Attributes
                  </Heading>
                  <Text className="text-xs text-ui-fg-subtle">
                    Add any extra custom specifications or notes
                  </Text>
                </div>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={() =>
                    setCustomRows((prev) => [
                      ...prev,
                      {
                        id: String(Date.now() + Math.random()),
                        key: "",
                        value: "",
                      },
                    ])
                  }
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Field
                </Button>
              </div>

              {customRows.length === 0 ? (
                <Text className="text-xs text-ui-fg-muted italic">
                  No additional custom attributes added.
                </Text>
              ) : (
                <div className="space-y-2.5">
                  {customRows.map((row, idx) => (
                    <div key={row.id} className="flex items-center gap-x-2">
                      <Input
                        placeholder="Attribute Name (e.g. series)"
                        value={row.key}
                        onChange={(e) => {
                          const updated = [...customRows];
                          updated[idx].key = e.target.value;
                          setCustomRows(updated);
                        }}
                        className="w-full"
                      />
                      <Input
                        placeholder="Value (e.g. Volume 1)"
                        value={row.value}
                        onChange={(e) => {
                          const updated = [...customRows];
                          updated[idx].value = e.target.value;
                          setCustomRows(updated);
                        }}
                        className="w-full"
                      />
                      <Button
                        type="button"
                        size="small"
                        variant="transparent"
                        className="text-ui-fg-muted hover:text-ui-fg-error p-1.5"
                        onClick={() =>
                          setCustomRows((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Drawer.Body>

          <Drawer.Footer className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button variant="secondary" disabled={isSaving}>
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
            >
              Save Attributes
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

export default ProductAttributesWidget;
