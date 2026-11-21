import {
  HOME_ROOM_ASSEMBLY_TYPE,
  HOME_SELECTED_PROJECTS_TYPE,
  HOME_DESIGN_CONSULTATION_TYPE,
  type CmsPublishedSection,
} from "@fs/cms-contracts";
import { CmsSectionList } from "../features/cms/section-renderer";
import { getPublishedPage } from "../features/cms/api";

export const dynamic = "force-dynamic";

function orderHomeSections(sections: readonly CmsPublishedSection[]) {
  const nextSections = [...sections];
  let selectedIndex = nextSections.findIndex(
    (section) => section.type === HOME_SELECTED_PROJECTS_TYPE,
  );

  if (selectedIndex < 0) return nextSections;

  const roomAssemblyIndex = nextSections.findIndex(
    (section) => section.type === HOME_ROOM_ASSEMBLY_TYPE,
  );
  if (roomAssemblyIndex > selectedIndex) {
    const [roomAssembly] = nextSections.splice(roomAssemblyIndex, 1);
    selectedIndex = nextSections.findIndex(
      (section) => section.type === HOME_SELECTED_PROJECTS_TYPE,
    );
    nextSections.splice(selectedIndex, 0, roomAssembly);
  }

  const consultationIndex = nextSections.findIndex(
    (section) => section.type === HOME_DESIGN_CONSULTATION_TYPE,
  );
  selectedIndex = nextSections.findIndex(
    (section) => section.type === HOME_SELECTED_PROJECTS_TYPE,
  );
  if (consultationIndex >= 0 && consultationIndex !== selectedIndex + 1) {
    const [consultation] = nextSections.splice(consultationIndex, 1);
    selectedIndex = nextSections.findIndex(
      (section) => section.type === HOME_SELECTED_PROJECTS_TYPE,
    );
    nextSections.splice(selectedIndex + 1, 0, consultation);
  }

  return nextSections;
}

export default async function Home() {
  const page = await getPublishedPage("home").catch(() => null);
  return <CmsSectionList sections={orderHomeSections(page?.sections ?? [])} />;
}
