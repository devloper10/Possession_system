using System.ComponentModel.DataAnnotations;

namespace Eststate.Models
{
    public class Logs
    {
        [Key]
        public int Id { get; set; }
        public string log { get; set; }
        public DateTime date { get; set; } = DateTime.Now;

    }
}
