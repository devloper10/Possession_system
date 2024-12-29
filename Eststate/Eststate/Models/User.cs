using System.ComponentModel.DataAnnotations;

namespace Eststate.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string guidId { get; set; } = Guid.NewGuid().ToString();
        public string role { get; set; }
        public string userName { get; set; }
        public string passWord { get; set; }
        public string fullName { get; set; }
        public bool IsTemporaryPassword { get; set; } = false;


    }
}
