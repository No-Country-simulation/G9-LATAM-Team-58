export interface AnalyzeTemplate {
	key: string;
	label: string;
	title: string;
	body: string;
}

export const ANALYZE_TEMPLATES: AnalyzeTemplate[] = [
	{
		key: 'spring-boot',
		label: 'Spring Boot',
		title: 'Introducción a Spring Boot',
		body: 'Spring Boot hace que sea fácil crear aplicaciones basadas en Spring de grado de producción que puedes "simplemente ejecutar". Toma una visión opinada de la plataforma Spring y de las bibliotecas de terceros para que puedas comenzar con un mínimo de alboroto.\n\nCaracterísticas principales:\n- Crea aplicaciones Spring independientes\n- Incrusta Tomcat, Jetty o Undertow directamente\n- Proporciona dependencias "starter" opinadas\n- Configura automáticamente bibliotecas Spring'
	},
	{
		key: 'react-hooks',
		label: 'React Hooks',
		title: 'Hooks de React',
		body: 'Los hooks permiten usar estado y otras características de React sin escribir clases. useState devuelve un par [estado, actualizador]; useEffect ejecuta efectos secundarios tras el renderizado; useMemo memoriza valores y useCallback funciones para evitar re-renders innecesarios.\n\nReglas de los hooks:\n- Llámalos solo en el nivel superior del componente\n- Llámalos solo desde componentes o hooks propios\n- Nunca dentro de condicionales, bucles o funciones anidadas'
	},
	{
		key: 'kubernetes',
		label: 'Kubernetes',
		title: 'Fundamentos de Kubernetes',
		body: 'Kubernetes es una plataforma de orquestación de contenedores. Un clúster se compone de nodos; los Pods son la unidad mínima desplegable y envuelven uno o más contenedores.\n\nConceptos clave:\n- Deployments: declaran el estado deseado\n- Services: exponen los Pods con una IP estable y balanceo de carga\n- Ingress: enruta tráfico HTTP(S) hacia los Services por host y path'
	}
];
