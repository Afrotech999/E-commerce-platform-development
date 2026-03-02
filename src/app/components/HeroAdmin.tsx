// src/app/components/HeroAdmin.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { fetchHeroSlides, updateHeroSlides, type HeroSlide } from '../../api/hero';
import { uploadImage } from '../../api/uploads';

type SlideDraft = HeroSlide & { _key: string };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeImageUrl(image: string, apiBase: string) {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  // handle "/uploads/xxx"
  if (image.startsWith('/')) return `${apiBase}${image}`;
  return `${apiBase}/${image}`;
}

export function HeroAdmin() {
  const apiBase = useMemo(() => (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, ''), []);
  const [slides, setSlides] = useState<SlideDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setSaveMsg(null);
    try {
      const data = await fetchHeroSlides();
      setSlides(
        data.map((s) => ({
          ...s,
          _key: uid(),
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load hero slides');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        _key: uid(),
        image: '',
        title: '',
        subtitle: '',
        cta: '',
        link: '',
      },
    ]);
  };

  const removeSlide = (key: string) => {
    setSlides((prev) => prev.filter((s) => s._key !== key));
  };

  const move = (from: number, to: number) => {
    setSlides((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const updateField = (key: string, patch: Partial<SlideDraft>) => {
    setSlides((prev) => prev.map((s) => (s._key === key ? { ...s, ...patch } : s)));
  };

  const onUpload = async (key: string, file: File) => {
  setError(null);
  setSaveMsg(null);
  try {
    const url = await uploadImage(file); // ✅ returns string
    updateField(key, { image: url });
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Upload failed');
  }
};

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaveMsg(null);

    // basic validation
    const bad = slides.find((s) => !s.image || !s.title || !s.subtitle);
    if (bad) {
      setSaving(false);
      setError('Each slide must have image, title, and subtitle.');
      return;
    }

    try {
      const payload: HeroSlide[] = slides.map((s) => ({
        image: s.image.trim(),
        title: s.title.trim(),
        subtitle: s.subtitle.trim(),
        cta: (s.cta || '').trim() || undefined,
        link: (s.link || '').trim() || undefined,
      }));

      const saved = await updateHeroSlides(payload);
      setSlides(saved.map((s) => ({ ...s, _key: uid() })));
      setSaveMsg('Saved!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading hero slides…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Hero Slides</h2>
          <p className="text-sm text-gray-500">Manage homepage carousel slides.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Reload</Button>
          <Button onClick={addSlide}>Add Slide</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saveMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {saveMsg}
        </div>
      )}

      <div className="space-y-3">
        {slides.map((s, index) => (
          <Card key={s._key} className="overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Slide #{index + 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === slides.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    Down
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeSlide(s._key)}>
                    Remove
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* preview */}
                <div className="lg:col-span-1">
                  <div className="aspect-[16/9] rounded-lg bg-gray-100 overflow-hidden">
                    {s.image ? (
                      <img
                        src={normalizeImageUrl(s.image, apiBase)}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <Label className="text-xs">Upload image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload(s._key, f);
                      }}
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Stored as <span className="font-mono">{s.image || '(empty)'}</span>
                    </p>
                  </div>
                </div>

                {/* fields */}
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={s.title}
                      onChange={(e) => updateField(s._key, { title: e.target.value })}
                      placeholder="AirMax Pro"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtitle</Label>
                    <Input
                      value={s.subtitle}
                      onChange={(e) => updateField(s._key, { subtitle: e.target.value })}
                      placeholder="Wireless Headphones"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">CTA (button text)</Label>
                      <Input
                        value={s.cta ?? ''}
                        onChange={(e) => updateField(s._key, { cta: e.target.value })}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Link (product id)</Label>
                      <Input
                        value={s.link ?? ''}
                        onChange={(e) => updateField(s._key, { link: e.target.value })}
                        placeholder="1  (product id)"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">
                        Your carousel calls: <span className="font-mono">onNavigate('product', link)</span>
                        <br />
                        So put product id here (example: <span className="font-mono">1</span> or <span className="font-mono">101</span>)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          No slides. Click <b>Add Slide</b>.
        </div>
      )}
    </div>
  );
}