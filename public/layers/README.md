# Layer Art

Drop transparent PNG assets here to make `services/hashlipsCompositor.ts`
produce real beast images instead of the text-based placeholder.

## File naming

`public/layers/<LayerName>/<trait-value-slug>.png`

The slug is the trait `value` from `hashlips_config.json`, lowercased, with
non-alphanumerics collapsed to `-`. Examples:

| Trait value          | File path                                  |
| -------------------- | ------------------------------------------ |
| `Laser Katana`       | `Weapon/laser-katana.png`                  |
| `Slum Alley`         | `Background/slum-alley.png`                |
| `Monk Robes (Neon Trim)` | `Clothes/monk-robes-neon-trim.png`     |
| `All-Seeing Third Eye`   | `Eyes/all-seeing-third-eye.png`        |

## Layer order (back → front)

Defined in `hashlips_config.json` under `layerConfigurations[0].layersOrder`:

1. `Background`
2. `Aura`
3. `Body`
4. `Skin_Pattern`
5. `Clothes`
6. `Cybernetics`
7. `Eyes`
8. `Mouth`
9. `Headgear`
10. `Weapon`
11. `Accessory`
12. `Spirit_Projection`

## Variants without art

These trait values mean "no visible layer" and are skipped by the compositor —
no file needed:

- `None` (Aura, Cybernetics, Headgear, Weapon, Accessory)
- `Clean` (Skin_Pattern)
- `Dormant` (Spirit_Projection)

## Format

- 512×512 PNG, transparent background
- All layers must align to the same pixel grid so they composite cleanly
- Missing files fall through silently — partial art still renders, with the
  remaining layers omitted

## Generating with the real HashLips CLI

If you'd rather pre-generate a finite collection instead of compositing in the
browser, run the upstream HashLips Art Engine over the same folder structure
and ship the rendered PNGs as static assets keyed by token ID. The two
approaches can coexist: pre-rendered IDs go in one folder, dynamic
breeding/evolution outputs use the runtime compositor.
