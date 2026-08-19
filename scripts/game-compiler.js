const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const specPath = path.join(ROOT, 'game-targets', 'KELPLANTIS-GAME-TARGET-001.json');
const template = path.join(ROOT, 'game-template');
const out = path.join(ROOT, 'game-build', 'GAME-TARGET-001', 'UnityProject');
const reportPath = path.join(ROOT, 'game-build', 'GAME-TARGET-001', 'GAME-TARGET-001-COMPILER-REPORT.json');

function fail(message) { throw new Error('GAME COMPILER: ' + message); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
if (spec.target_id !== 'GAME-TARGET-001') fail('wrong target');
if (spec.engine !== 'Unity') fail('target engine must be Unity');
if (spec.platform !== 'Windows') fail('target platform must be Windows');
if (!spec.enemies.role_targeting) fail('role targeting is required');
if (!spec.world.town || !spec.world.dungeon) fail('town and dungeon are required');
if (spec.loot.items < 20) fail('loot target too small');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(template, out, { recursive: true });

const config = `using UnityEngine;\n\npublic static class GameConfig\n{\n    public const string TargetId = ${JSON.stringify(spec.target_id)};\n    public const string GameId = ${JSON.stringify(spec.game_id)};\n    public const int EnemyTypes = ${spec.enemies.types};\n    public const int LootItems = ${spec.loot.items};\n    public const int SkillCount = ${spec.skills};\n    public const int QuestKills = ${spec.quest.kill_goblins};\n    public const int DungeonRooms = ${spec.world.dungeon_rooms};\n}\n`;
fs.mkdirSync(path.join(out, 'Assets', 'Scripts'), { recursive: true });
fs.writeFileSync(path.join(out, 'Assets', 'Scripts', 'GameConfig.generated.cs'), config);

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const rel = path.relative(out, p).replaceAll(path.sep, '/');
    if (fs.statSync(p).isDirectory()) walk(p); else files.push(rel);
  }
}
walk(out);
const report = {
  schema_version: 'BEC-GAME-COMPILER-1.0',
  status: 'GENERATED_NOT_BUILT',
  target_id: spec.target_id,
  game_id: spec.game_id,
  engine: spec.engine,
  unity_version: spec.unity_version,
  platform: spec.platform,
  output: 'game-build/GAME-TARGET-001/UnityProject',
  file_count: files.length,
  required_runtime_features: spec.verification,
  next_gate: 'Unity batch build to Builds/Kelplantis/Kelplantis.exe',
  generated_at_utc: new Date().toISOString()
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
