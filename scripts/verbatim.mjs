/* Names that stay in Latin script whatever the surrounding language.
   
   One list. It was three, hand-retyped into lint-translations.mjs,
   pages-translate.mjs and delta-translate.mjs, and by the time an audit
   counted them they already disagreed -- one of them under a comment saying
   they could not.
   
   Finder is deliberately absent. Apple translates it, and Chinese macOS calls
   it 访达; GLOSSARY.md covers it as an apple-term instead. */
export const VERBATIM = [
  "Lukotta", "macOS", "BitLocker", "NTFS", "LUKS", "LVM", "APFS", "FileVault",
  "ext2", "ext3", "ext4", "btrfs", "XFS", "exFAT", "FAT",
  "qcow2", "VMDK", "VDI", "VHDX", "VHD", "IMG", "DMG", "OVA", "TPM",
  "VMware", "VirtualBox", "Hyper-V", "QEMU", "UTM", "Windows", "Linux",
  "Apple Silicon", "Sequoia", "GitHub", "SECURITY.md", "llms.txt",
  "github.com", "rahula.dev", "GNU General Public License",
  "Creative Commons Attribution-ShareAlike 4.0",
];

/* A name has survived if it is still there in Latin script. Only the start is
   anchored: Estonian writes BitLockeriga and Finnish BitLockerilla, and a name
   carrying a case ending is still the name. What this looks for is the name
   replaced by a local spelling of it. */
export const survives = (term, text) =>
  new RegExp(`(^|[^A-Za-z0-9])${term.replace(/[.\/\-]/g, "\\$&")}`, "i").test(text);
