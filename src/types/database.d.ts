export interface ModBuild {
	build_id: number,
	created_at: string,
	mod_id: number,
    download_url: string, // Ссылка на ZIP архив с модом
    version: string, // Фактическая версия мода (Например "v1.3.2")
    changes: string, // Возможно описание изменений в markdown / html
}

export interface Mod {
	mod_id: number,
	created_at: string,
    name: string, // Название мода
    description: string, // Описание мода
    thumbnail_url: string, // URL основной "обложки" мода
    social_urls: string[], // Ссылки на ресурсы мода (не реализованно)
    content_urls: string[], // Массив ссылок на картинки и/или ID видео на ютуб (Например "iRbeC_BbMqM"),
    archive_type: string, // Пока что поддерживается только "zip"
    standalone: boolean, // При значении true: мод не требует оригинальную игру
    platform: "soc" | "cs" | "cop", // ID требуемой игры\
	restricted: boolean,
	"mod-builds": ModBuild[]
}