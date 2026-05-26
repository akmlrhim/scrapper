import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./auth";
import * as XLSX from "xlsx";

const CACHE_TTL = 60_000; // 60 seconds

export const useLeadsStore = defineStore("leads", () => {
  const leads = ref([]);
  const loading = ref(false); // full-screen spinner — only when no data yet
  const refreshing = ref(false); // subtle indicator — data visible, fetching in background
  const error = ref("");
  const totalCount = ref(0);
  const page = ref(1);
  const pageSize = ref(25);
  const search = ref("");
  const filters = ref({ province: "", city: "", keyword: "", hasWebsite: null, hasPixel: null });
  const lastFetched = ref(null);

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));
  const isFresh = computed(() => lastFetched.value && Date.now() - lastFetched.value < CACHE_TTL);

  async function fetchLeads({ silent = false } = {}) {
    const auth = useAuthStore();
    if (!auth.user?.id) return;

    const hasData = leads.value.length > 0;
    if (hasData || silent) {
      refreshing.value = true;
    } else {
      loading.value = true;
    }
    error.value = "";

    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .range((page.value - 1) * pageSize.value, page.value * pageSize.value - 1);

      if (search.value) {
        query = query.or(
          `business_name.ilike.%${search.value}%,address.ilike.%${search.value}%,phone.ilike.%${search.value}%`,
        );
      }
      if (filters.value.province) query = query.eq("province", filters.value.province);
      if (filters.value.city) query = query.eq("city", filters.value.city);
      if (filters.value.keyword) query = query.ilike("keyword", `%${filters.value.keyword}%`);
      if (filters.value.hasWebsite !== null) query = query.eq("has_website", filters.value.hasWebsite);
      if (filters.value.hasPixel !== null) query = query.eq("has_meta_pixel", filters.value.hasPixel);

      const { data, count, error: supaErr } = await query;
      if (supaErr) throw supaErr;
      leads.value = data ?? [];
      totalCount.value = count ?? 0;
      lastFetched.value = Date.now();
    } catch (e) {
      error.value = e.message || "Gagal memuat data leads.";
      if (!leads.value.length) {
        leads.value = [];
        totalCount.value = 0;
      }
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  }

  function setPage(p) {
    page.value = p;
    fetchLeads();
  }

  function setSearch(s) {
    search.value = s;
    page.value = 1;
    fetchLeads();
  }

  function setFilters(f) {
    filters.value = { ...filters.value, ...f };
    page.value = 1;
    fetchLeads();
  }

  async function exportCSV() {
    const auth = useAuthStore();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    const ws = XLSX.utils.json_to_sheet(data ?? []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `geoleads_export_${new Date().toISOString().split("T")[0]}.csv`, { bookType: "csv" });
  }

  async function exportExcel() {
    const auth = useAuthStore();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    const ws = XLSX.utils.json_to_sheet(data ?? []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `geoleads_export_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  function invalidateCache() {
    lastFetched.value = null;
  }

  return {
    leads,
    loading,
    refreshing,
    error,
    totalCount,
    page,
    pageSize,
    search,
    filters,
    totalPages,
    lastFetched,
    isFresh,
    fetchLeads,
    setPage,
    setSearch,
    setFilters,
    exportCSV,
    exportExcel,
    invalidateCache,
  };
});
